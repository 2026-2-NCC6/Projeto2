#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <ArduinoBLE.h>
#include "Arduino_LED_Matrix.h"

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET    -1

// ============================================================================
// METADADOS DO SISTEMA EMBARCADO (ENVIADOS APENAS 1x NO HANDSHAKE BLE)
// ============================================================================
#define DEVICE_NAME     "FLUX-Tennis-R4"
#define BOARD_MODEL     "Arduino UNO R4 WiFi"
#define FIRMWARE_VER    "v1.0.0"

// Instancia a Matriz de LEDs 12x8 nativa do Arduino UNO R4 WiFi
ArduinoLEDMatrix matrix;

// Bitmap 8x12: Ícone "X" (Desconectado / Aguardando Bluetooth)
uint8_t ICON_DESCONECTADO_X[8][12] = {
  { 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0 },
  { 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0 },
  { 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0 },
  { 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0 },
  { 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0 },
  { 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0 },
  { 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0 },
  { 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0 }
};

// Bitmap 8x12: Ícone "Check ✓" (Conectado via Bluetooth ao App)
uint8_t ICON_CONECTADO_CHECK[8][12] = {
  { 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1 },
  { 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1 },
  { 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0 },
  { 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0 },
  { 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0 },
  { 0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0 },
  { 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0 },
  { 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0 }
};

// Instancia o display OLED no barramento I2C
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
bool oledDisponivel = false;

// Instancia o sensor de movimento IMU MPU6050 (Acelerômetro + Giroscópio)
Adafruit_MPU6050 mpu;
bool mpuDisponivel = false;

// ============================================================================
// CONFIGURAÇÃO BLUETOOTH LOW ENERGY (BLE) - COMPATÍVEL COM O FRONTEND FLUX
// ============================================================================
// Serviço padrão de Bateria BLE (0x180F)
BLEService batteryService("180F");
BLEUnsignedCharCharacteristic batteryLevelChar("2A19", BLERead | BLENotify);

// Serviço principal do FLUX Smart Tennis
BLEService fluxImuService("4fafc201-1fb5-459e-8fcc-c5c9c331914b");

// Característica 1: Ficha Estática do Aparelho (Modelo|Versão) -> Lida apenas 1x na conexão!
BLEStringCharacteristic fluxDeviceInfoChar(
  "beb5483e-36e1-4688-b7f5-ea07361b26a9",
  BLERead,
  64
);

// Característica 2: Stream de Telemetria IMU durante o treino
BLEStringCharacteristic fluxTelemetryChar(
  "beb5483e-36e1-4688-b7f5-ea07361b26a8",
  BLERead | BLENotify | BLEWrite,
  64
);

// Intervalo de transmissão (50ms = 20 Hz, ideal para calcular delta t e dinâmicas de movimento)
#define SAMPLE_INTERVAL_MS 50

unsigned long ultimoEnvioMs = 0;
unsigned long ultimoDisplayMs = 0;
unsigned long contadorFrames = 0;
uint8_t nivelBateria = 96;
bool estavaConectado = false;

// Atualiza a Matriz de LEDs 12x8 da placa UNO R4 WiFi (Check = conectado, X = desconectado)
void atualizarMatrizLED(bool conectado) {
  if (conectado) {
    matrix.renderBitmap(ICON_CONECTADO_CHECK, 8, 12);
  } else {
    matrix.renderBitmap(ICON_DESCONECTADO_X, 8, 12);
  }
}

// Endereço I2C detectado para o sensor MPU6050 (0x68 ou 0x69)
uint8_t mpuEnderecoI2C = 0x68;
int leiturasZeradasConsecutivas = 0;

// Re-acorda o MPU6050 caso ruídos ou timeout no I2C o coloquem em Sleep Mode (PWR_MGMT_1)
void acordarMPU() {
  Wire.beginTransmission(mpuEnderecoI2C);
  Wire.write(0x6B); // Registrador PWR_MGMT_1
  Wire.write(0x00); // Zera o bit de Sleep
  Wire.endTransmission(true);
}

// Monta o payload padronizado com Frame, Timestamp, 6 eixos, Temperatura e Bateria:
// Formato: "IMU:FRAME,MILLIS,AX,AY,AZ,GX,GY,GZ,TEMP,BAT"
String obterPayloadIMU(unsigned long frameId, unsigned long timestampMs) {
  String payload = "IMU:" + String(frameId) + "," + String(timestampMs) + ",";

  if (mpuDisponivel) {
    sensors_event_t a, g, temp;
    if (mpu.getEvent(&a, &g, &temp)) {
      // Se todos os 3 eixos de aceleração vierem exatamente 0.00, o sensor entrou em Sleep ou travou
      if (a.acceleration.x == 0.0f && a.acceleration.y == 0.0f && a.acceleration.z == 0.0f) {
        leiturasZeradasConsecutivas++;
        if (leiturasZeradasConsecutivas > 3) {
          acordarMPU(); // Força acordar o sensor
          leiturasZeradasConsecutivas = 0;
        }
      } else {
        leiturasZeradasConsecutivas = 0;
      }

      payload += String(a.acceleration.x, 2) + ",";
      payload += String(a.acceleration.y, 2) + ",";
      payload += String(a.acceleration.z, 2) + ",";
      payload += String(g.gyro.x, 2) + ",";
      payload += String(g.gyro.y, 2) + ",";
      payload += String(g.gyro.z, 2) + ",";
      payload += String(temp.temperature, 1) + ",";
      payload += String(nivelBateria);
    } else {
      acordarMPU();
      payload += "0.00,0.00,0.00,0.00,0.00,0.00,0.0," + String(nivelBateria);
    }
  } else {
    // Fallback caso o sensor I2C nao responda
    payload += "0.00,0.00,0.00,0.00,0.00,0.00,0.0," + String(nivelBateria);
  }

  return payload;
}

// Atualiza o display OLED com o status atual do Bluetooth e telemetria
void atualizarDisplay(bool conectado, String enderecoCentral) {
  if (!oledDisponivel) return;

  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);

  // Cabeçalho
  display.setCursor(0, 0);
  display.print(DEVICE_NAME);
  display.print(" ");
  display.println(FIRMWARE_VER);
  display.drawLine(0, 11, 127, 11, SSD1306_WHITE);

  // Status da conexão Bluetooth
  display.setCursor(0, 16);
  if (conectado) {
    display.println("BLE: CONECTADO! [OK]");
    display.setCursor(0, 28);
    display.print("App: ");
    display.println(enderecoCentral);
  } else {
    display.println("BLE: DESCONECTADO [X]");
    display.setCursor(0, 28);
    display.println(BOARD_MODEL);
  }

  // Rodapé com contador de frames de telemetria enviados
  display.setCursor(0, 44);
  display.print("Frames IMU: ");
  display.println(contadorFrames);

  display.setCursor(0, 55);
  display.print("Bateria: ");
  display.print(nivelBateria);
  display.println("%");

  display.display();
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  // 1. Inicializa a Matriz de LEDs 12x8 do UNO R4 WiFi (começa exibindo "X")
  matrix.begin();
  atualizarMatrizLED(false);

  // 2. Inicializa barramento I2C em Fast Mode (400 kHz) para evitar colisão entre OLED e MPU6050
  Wire.begin();
  Wire.setClock(400000); // 400 kHz Fast Mode (libera o barramento rapidamente)
  Wire.setTimeout(50);

  Serial.println("\n--- INICIALIZANDO FLUX WEARABLE (UNO R4 WIFI) ---");

  if (display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    oledDisponivel = true;
  } else if (display.begin(SSD1306_SWITCHCAPVCC, 0x3D)) {
    oledDisponivel = true;
  } else {
    Serial.println("[AVISO] Display OLED nao detectado. Usando Matriz de LEDs 12x8 + BLE.");
  }

  // 3. Inicializa o sensor MPU6050 (Acelerômetro + Giroscópio)
  if (mpu.begin(0x68)) {
    mpuDisponivel = true;
    mpuEnderecoI2C = 0x68;
    mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
    mpu.setGyroRange(MPU6050_RANGE_500_DEG);
    mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);
    acordarMPU();
    Serial.println("[OK] Sensor MPU6050 inicializado no endereco 0x68!");
  } else if (mpu.begin(0x69)) {
    mpuDisponivel = true;
    mpuEnderecoI2C = 0x69;
    mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
    mpu.setGyroRange(MPU6050_RANGE_500_DEG);
    mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);
    acordarMPU();
    Serial.println("[OK] Sensor MPU6050 inicializado no endereco 0x69!");
  } else {
    Serial.println("[AVISO] Sensor MPU6050 nao encontrado no barramento I2C (verifique pinos SDA/SCL, alimentacao e AD0 no GND).");
  }

  // 4. Inicializa o módulo Bluetooth Low Energy (ArduinoBLE)
  if (!BLE.begin()) {
    Serial.println("[ERRO] Falha ao iniciar o modulo Bluetooth Low Energy (BLE)!");
    while (1) {
      delay(1000);
    }
  }

  // Define o nome visível no navegador (Web Bluetooth) e no Smartphone
  BLE.setDeviceName(DEVICE_NAME);
  BLE.setLocalName(DEVICE_NAME);

  // Configura e adiciona o serviço de Bateria (0x180F)
  batteryService.addCharacteristic(batteryLevelChar);
  BLE.addService(batteryService);
  batteryLevelChar.writeValue(nivelBateria);

  // Configura e adiciona o serviço principal do FLUX
  fluxImuService.addCharacteristic(fluxDeviceInfoChar);
  fluxImuService.addCharacteristic(fluxTelemetryChar);
  BLE.addService(fluxImuService);

  // Registra o Modelo da Placa e a Versão do Software UMA ÚNICA VEZ no registrador GATT
  // Formato: "Modelo da Placa|Versao do Software" (lido pelo Frontend apenas no handshake)
  String handshakeMetadata = String(BOARD_MODEL) + "|" + String(FIRMWARE_VER);
  fluxDeviceInfoChar.writeValue(handshakeMetadata);
  fluxTelemetryChar.writeValue("FLUX_READY");

  // Anuncia o serviço principal para ser encontrado no scan
  BLE.setAdvertisedService(fluxImuService);

  // Inicia o advertising BLE
  BLE.advertise();

  Serial.print("[OK] BLE Ativo! Metadados embarcados registrados: ");
  Serial.println(handshakeMetadata);
  atualizarDisplay(false, "");
}

void loop() {
  // Escuta conexões de um dispositivo Central (Navegador Web ou Smartphone)
  BLEDevice central = BLE.central();

  if (central) {
    if (!estavaConectado) {
      estavaConectado = true;
      Serial.print("[BLE] Conectado ao App! MAC Central: ");
      Serial.println(central.address());

      // Garante que o nível de bateria inicial está atualizado no handshake
      batteryLevelChar.writeValue(nivelBateria);

      // Desenha o CHECK (✓) na Matriz de LEDs 12x8 do Arduino UNO R4 WiFi!
      atualizarMatrizLED(true);
      atualizarDisplay(true, central.address());
    }

    // Enquanto o app estiver conectado ao Arduino
    while (central.connected()) {
      unsigned long agora = millis();

      // Envia telemetria IMU em alta frequencia via BLE e Serial
      if (agora - ultimoEnvioMs >= SAMPLE_INTERVAL_MS) {
        ultimoEnvioMs = agora;
        contadorFrames++;

        String payload = obterPayloadIMU(contadorFrames, agora);

        // 1. Envia via Bluetooth BLE
        fluxTelemetryChar.writeValue(payload);

        // 2. Envia exatamente o mesmo pacote via Serial (115200 baud)
        Serial.println(payload);
      }

      // Atualiza o display OLED em taxa menor (1 segundo) para nao concorrer no barramento I2C com o MPU
      if (agora - ultimoDisplayMs >= 1000) {
        ultimoDisplayMs = agora;
        atualizarDisplay(true, central.address());
      }

      BLE.poll();
    }

    // Quando o app desconectar, volta a desenhar o X na Matriz de LEDs 12x8!
    estavaConectado = false;
    Serial.print("[BLE] Desconectado de: ");
    Serial.println(central.address());
    atualizarMatrizLED(false);
    atualizarDisplay(false, "");
  } else {
    unsigned long agora = millis();
    if (agora - ultimoEnvioMs >= SAMPLE_INTERVAL_MS) {
      ultimoEnvioMs = agora;
      contadorFrames++;

      String payload = obterPayloadIMU(contadorFrames, agora);
      Serial.println(payload);
    }

    if (agora - ultimoDisplayMs >= 1000) {
      ultimoDisplayMs = agora;
      atualizarDisplay(false, "");
    }
  }
}
