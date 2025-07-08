import React, { useState, useRef, useEffect } from 'react';
import './STTModal.css';
import api from '../../axios-config';
import { toast } from 'react-toastify';

const STTModal = ({ isOpen, onClose, onProcessedData }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Seu navegador não suporta reconhecimento de voz.');
    } else {
      // Verificar permissões do microfone
      checkMicrophonePermissions();
    }
  }, []);

  const checkMicrophonePermissions = async () => {
    try {
      if (navigator.permissions) {
        const result = await navigator.permissions.query({ name: 'microphone' });
        if (result.state === 'denied') {
          setError('Permissão do microfone negada. Por favor, permita o acesso ao microfone nas configurações do navegador.');
        }
      }
    } catch (err) {
      setPermissionError(true);
    }
  };

  const startListening = async () => {
    setError('');
    
    // Primeiro, tentar obter permissão do microfone
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      setError('Não foi possível acessar o microfone. Verifique as permissões do navegador.');
      return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError('Reconhecimento de voz não suportado pelo navegador.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false; // Mudando para false para evitar problemas de rede
    recognition.interimResults = true;
    recognition.lang = 'pt-BR';
    recognition.maxAlternatives = 1;
    
    // Configurações adicionais para tentar contornar problemas de rede
    if (recognition.hasOwnProperty('serviceURI')) {
      // Alguns navegadores permitem configurar o serviço
      recognition.serviceURI = 'https://www.google.com/speech-api/v2/recognize';
    }

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setTranscript(prev => prev + ' ' + finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      let errorMessage = 'Erro no reconhecimento de voz';
      
      switch (event.error) {
        case 'network':
          errorMessage = `Erro de rede da Web Speech API.\n\nEste problema é comum no navegador Google Chrome.\nTente usar outro navegador.`;
          break;
        case 'not-allowed':
          errorMessage = 'Acesso ao microfone negado. Por favor, permita o acesso ao microfone.';
          break;
        case 'no-speech':
          errorMessage = 'Nenhuma fala detectada. Tente falar mais alto ou verificar seu microfone.';
          break;
        case 'audio-capture':
          errorMessage = 'Erro ao capturar áudio. Verifique se seu microfone está funcionando.';
          break;
        case 'service-not-allowed':
          errorMessage = 'Serviço de reconhecimento não permitido. Tente usar HTTPS.';
          break;
        default:
          errorMessage = `Erro no reconhecimento: ${event.error}`;
      }
      
      setError(errorMessage);
      setIsListening(false);
      
      // Para erro de network, nota para o usuário
   
    };

    recognition.onend = () => {
      setIsListening(false);
      // Removido auto-restart para evitar loops de erro
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const processTranscript = async () => {
    if (!transcript.trim()) {
      setError('Nenhum texto foi capturado para processar.');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const response = await api.post('/stt/process', { text: transcript });
      onProcessedData(response.data);
      onClose();
    } catch (err) {
      console.error('Erro ao processar texto:', err);
      let errorMsg = '';
      let errorType = 'UNKNOWN';
      
      if (err.response) {
        const errorData = err.response.data;
        errorType = errorData?.type || 'SERVER_ERROR';
        
        // Tratar erros específicos do backend
        switch (errorType) {
          case 'IA_EMPTY_RESPONSE':
            errorMsg = `${errorData.details}\n\nSugestão: ${errorData.suggestion}\n\nDica: Use frases como "Cliente João, dentista Maria, data 20/12/2024"`;
            break;
          case 'WEBHOOK_NOT_REGISTERED':
            errorMsg = `${errorData.details}\n\nComo resolver: ${errorData.suggestion}`;
            break;
          case 'WEBHOOK_NOT_FOUND':
            errorMsg = `${errorData.details}\n\nVerifique: ${errorData.suggestion}`;
            break;
          case 'SERVICE_UNAVAILABLE':
            errorMsg = `${errorData.details}\n\nPara iniciar: ${errorData.suggestion}`;
            break;
          case 'TIMEOUT_ERROR':
            errorMsg = `${errorData.details}\n\n${errorData.suggestion}`;
            break;
          default:
            errorMsg = `Erro no servidor (${err.response.status})`;
            if (errorData?.error) {
              errorMsg += `\n${errorData.error}`;
            }
            if (errorData?.details) {
              errorMsg += `\nDetalhes: ${errorData.details}`;
            }
            if (errorData?.suggestion) {
              errorMsg += `\nSugestão: ${errorData.suggestion}`;
            }
        }
      } else if (err.request) {
        errorType = 'NETWORK_ERROR';
        errorMsg = `Sem resposta do servidor.\n\nVerifique se o backend está rodando na porta 8080.\nComando: cd core && mvn spring-boot:run`;
      } else {
        errorType = 'CLIENT_ERROR';
        errorMsg = `Erro interno: ${err.message}`;
      }
      
      setError(errorMsg);
      
      // Para erros específicos, mostrar toast com tipo específico
      if (errorType === 'IA_EMPTY_RESPONSE') {
        toast.error('Texto muito vago. Seja mais específico!');
      } else if (errorType === 'WEBHOOK_NOT_REGISTERED') {
        toast.warning('Webhook não ativo. Execute o workflow no n8n!');
      } else if (errorType === 'SERVICE_UNAVAILABLE') {
        toast.error('Serviço de IA indisponível. Verifique o n8n!');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const clearTranscript = () => {
    setTranscript('');
    setError('');
  };

  const renderError = () => {
    if (!error) return null;
    
    // Determinar o tipo de erro para aplicar a classe CSS correta
    let errorClass = 'error-message';
    if (error.includes('rede') || error.includes('servidor')) {
      errorClass += ' network-error';
    } else if (error.includes('webhook')) {
      errorClass += ' webhook-error';
    } else if (error.includes('IA não conseguiu')) {
      errorClass += ' ia-error';
    } else if (error.includes('timeout')) {
      errorClass += ' timeout-error';
    }
    
    return (
      <div className={errorClass}>
        <div className="error-message-content">
          {error}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="stt-modal-overlay" onClick={handleOverlayClick}>
      <div className="stt-modal">
        <div className="stt-modal-header">
          <h2>Reconhecimento de Voz</h2>
          <button className="close-button" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="stt-modal-content">
          {/* Área de Controles STT - Topo */}
          <div className="stt-main-controls">
            {/* Botão principal de gravação */}
            <div className="stt-primary-control">
              {!isListening ? (
                <button 
                  className="btn-record-primary" 
                  onClick={startListening}
                  disabled={isProcessing}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                  </svg>
                  Iniciar Gravação
                </button>
              ) : (
                <button className="btn-stop-primary" onClick={stopListening}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="6" width="12" height="12" rx="2"/>
                  </svg>
                  Parar Gravação
                </button>
              )}
            </div>

            {/* Indicador de gravação */}
            {isListening && (
              <div className="recording-indicator">
                <div className="recording-pulse"></div>
                <span>Gravando... Fale agora</span>
              </div>
            )}

            {/* Área de texto capturado - Integrada ao topo */}
            {transcript && (
              <div className="transcript-area">
                <label>Texto Capturado:</label>
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  onFocus={(e) => {
                    if (e.target.value && e.target.value.trim() !== '') {
                      e.target.select();
                    }
                  }}
                  onClick={(e) => {
                    if (e.target.value && e.target.value.trim() !== '') {
                      e.target.select();
                    }
                  }}
                  placeholder="Digite ou fale para capturar o texto do pedido..."
                  rows="4"
                  className="form-textarea"
                />
                
                {/* Todos os botões em uma linha */}
                <div className="all-buttons-container">
                  <div className="left-buttons">
                    {/* Botões de ação removidos */}
                  </div>
                  
                  <div className="right-buttons">
                    <button 
                      className="btn-cancelar" 
                      onClick={clearTranscript}
                      disabled={isProcessing}
                    >
                      Limpar
                    </button>
                    <button 
                      className="btn-salvar-pedido" 
                      onClick={processTranscript}
                      disabled={!transcript.trim() || isProcessing}
                    >
                      {isProcessing ? 'Processando...' : 'Processar Pedido'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {renderError()}

          {/* Área de Instruções - Baixo */}
          <div className="stt-instructions">
            <h3>Como usar frases naturais:</h3>
            <div className="instructions-content">
              <ul>
                <li><strong>Cliente:</strong> "Cliente Maria Santos" ou "Cliente Dr. João Silva"</li>
                <li><strong>Dentista:</strong> "Dentista Dr. Carlos Pereira" ou "Dentista Dra. Ana Costa"</li>
                <li><strong>Protético:</strong> "Protético Roberto Lima" ou "Protético Helena Santos"</li>
                <li><strong>Dentes:</strong> "Dente 15" ou "Dentes 24 25 26" ou "Fazer coroa dente 21"</li>
                <li><strong>Data:</strong> "Data entrega 25/02/2025" ou "Entrega 15/03/2025"</li>
                <li><strong>Prioridade:</strong> Use "prioridade alta", "prioridade média" ou "prioridade baixa"</li>
              </ul>
              
              <div style={{marginTop: '12px', padding: '10px', background: '#f0f8ff', borderRadius: '6px', fontSize: '14px'}}>
                <strong>Exemplos completos:</strong><br/>
                • "Cliente Maria Santos, dentista Dr. Carlos Pereira, protético João Silva, dente 15, data entrega 25/02/2025, prioridade alta"<br/>
                • "Cliente Pedro Costa, dentista Dra. Ana Oliveira, protético Roberto Lima, fazer coroa dente 21, data entrega 10/03/2025"<br/>
                • "Cliente Luiza Ferreira, dentista Dr. Marcos Souza, fazer ponte dentes 14 15 16, prioridade média"
              </div>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
};

export default STTModal; 