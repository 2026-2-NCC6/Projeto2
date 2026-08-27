# Product Requirements Document (PRD) - Projeto FLUX

## 1. Visão Geral
Este documento descreve os requisitos para o desenvolvimento do **FLUX**, um wearable (relógio/bracelete inteligente) focado na detecção de movimentos biomecânicos e gamificação de exercícios. Inicialmente, o dispositivo está sendo desenvolvido para integrar o ecossistema do projeto interdisciplinar **Smart Tennis Arena**, com foco exclusivo no tênis. No entanto, sua arquitetura e modelo de detecção são agnósticos, com o objetivo futuro de expandir a detecção para movimentos de musculação e outros esportes.

## 2. Objetivo
Desenvolver um relógio/bracelete equipado com sensores inerciais (IMU) de alta precisão para capturar e detectar variáveis biomecânicas. O dispositivo utilizará um modelo de **Inteligência Artificial (IA)** para identificar a sequência de movimentos e golpes executáveis.
*   **Fase 1 (Atual - Tênis):** Fornecer telemetria precisa para cálculo de pontuações, feedbacks em tempo real (ex: forehand, backhand, saque) e gamificação das partidas na Smart Tennis Arena.


## 3. Público-Alvo
*   **Crianças e Iniciantes:** Busca por uma experiência lúdica, com reconhecimento de movimentos básicos para gerar recompensas, engajamento e feedback visual/sonoro.
*   **Adultos, Atletas e Praticantes Avançados:** Foco em desempenho. O dispositivo fornecerá métricas de precisão, consistência e classificação de tipos de golpe (no tênis) e execução/repetições (na musculação).
*   **Treinadores e Personal Trainers:** Utilizarão os dados gerados pelo bracelete e classificados pela IA para acompanhar a evolução técnica, ajustar metas e criar treinos mais eficientes no dashboard do sistema.
