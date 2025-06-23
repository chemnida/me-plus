import { useEffect, useRef, useState, useCallback } from 'react';
import { socket } from '@/utils/socket';
import type {
  CarouselItem,
  FunctionCall,
  PlanData,
} from '@/components/chatbot/BotBubbleFrame';
import {
  getSession,
  saveSession,
  convertToStoredMessage,
  convertFromStoredMessage,
  type ChatSession,
  type StoredMessage,
} from '@/utils/chatStorage';

// 서버 에러 타입 정의
export interface ServerError {
  type:
    | 'FUNCTION_ARGS_PARSE_ERROR'
    | 'MISSING_FUNCTION_ARGS'
    | 'UNKNOWN_FUNCTION'
    | 'FUNCTION_EXECUTION_ERROR'
    | 'OPENAI_API_ERROR'
    | 'NETWORK_ERROR'
    | 'STREAM_ABORTED'
    | 'REQUEST_TIMEOUT'
    | 'UNKNOWN_ERROR'
    | 'INVALID_INPUT'
    | 'DATABASE_ERROR'
    | 'PROMPT_BUILD_ERROR'
    | 'SESSION_SAVE_ERROR'
    | 'CONTROLLER_ERROR';
  message: string;
  details?: unknown;
}

// 에러 메시지 매핑
const getErrorMessage = (error: ServerError): string => {
  switch (error.type) {
    case 'OPENAI_API_ERROR':
      return '🤖 AI 서비스가 일시적으로 불안정합니다. 잠시 후 다시 시도해주세요.';
    case 'NETWORK_ERROR':
      return '🌐 네트워크 연결을 확인해주세요.';
    case 'STREAM_ABORTED':
      return '⏹️ 응답이 중단되었습니다. 다시 시도해주세요.';
    case 'REQUEST_TIMEOUT':
      return '⏱️ 응답 시간이 초과되었습니다. 다시 시도해주세요.';
    case 'DATABASE_ERROR':
      return '💾 대화 기록 저장에 문제가 있지만 대화는 계속 가능합니다.';
    case 'SESSION_SAVE_ERROR':
      return '📝 ' + error.message; // 서버에서 친절한 메시지를 보내줌
    case 'FUNCTION_ARGS_PARSE_ERROR':
      return '⚙️ 기능 처리 중 오류가 발생했습니다. 다시 시도해주세요.';
    case 'MISSING_FUNCTION_ARGS':
      return '📋 요청 정보가 불완전합니다. 다시 시도해주세요.';
    case 'UNKNOWN_FUNCTION':
      return '❓ 요청한 기능을 찾을 수 없습니다.';
    case 'INVALID_INPUT':
      return '📝 입력 내용을 확인해주세요.';
    default:
      return '❌ ' + error.message;
  }
};

type Message =
  | { type: 'user'; text: string }
  | {
      type: 'bot';
      messageChunks: string[];
      functionCall?: FunctionCall;
      selectedData?: {
        selectedItem?: CarouselItem;
        selectedServices?: string[];
        isSelected: boolean;
      }; // OTT Service 지원을 위해 확장
    }
  | { type: 'loading'; loadingType: 'searching' | 'waiting' | 'dbcalling' };

export const useChatSocket = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true); // 초기 로딩 상태 추가
  // 항상 로컬스토리지 사용
  const useLocalStorage = true;
  const responseRef = useRef('');

  // 로컬스토리지에 메시지 저장하는 함수
  const saveMessagesToLocal = useCallback(
    (messagesArray: Message[]) => {
      if (!useLocalStorage || !sessionId) return;

      try {
        const storedMessages: StoredMessage[] = messagesArray.map((msg) =>
          convertToStoredMessage(msg as Omit<StoredMessage, 'timestamp'>),
        );

        const chatSession: ChatSession = {
          sessionId,
          messages: storedMessages,
          lastUpdated: Date.now(),
        };

        saveSession(chatSession);
        console.log('💾 Messages saved to localStorage:', messagesArray.length);
      } catch (error) {
        console.error('❌ Failed to save messages to localStorage:', error);
      }
    },
    [useLocalStorage, sessionId],
  );

  // 로컬스토리지에서 메시지 불러오는 함수
  const loadMessagesFromLocal = useCallback(
    (sessionIdToLoad: string): Message[] => {
      if (!useLocalStorage) return [];

      try {
        const session = getSession(sessionIdToLoad);
        if (!session) return [];

        const messages: Message[] = session.messages.map(
          (msg) => convertFromStoredMessage(msg) as Message,
        );

        console.log('📂 Messages loaded from localStorage:', messages.length);
        return messages;
      } catch (error) {
        console.error('❌ Failed to load messages from localStorage:', error);
        return [];
      }
    },
    [useLocalStorage],
  );

  const handleSessionId = useCallback(
    (id: string) => {
      setSessionId(id);
      localStorage.setItem('sessionId', id);

      // 로컬스토리지 사용 시 기존 세션 불러오기
      if (useLocalStorage) {
        const localMessages = loadMessagesFromLocal(id);
        if (localMessages.length > 0) {
          setMessages(localMessages);
          console.log(
            '📂 로컬스토리지에서 세션 히스토리 불러옴:',
            localMessages.length,
          );
        } else {
          console.log('📭 로컬스토리지에 저장된 히스토리 없음');
        }
      }

      // 로딩 완료
      setIsInitialLoading(false);
    },
    [useLocalStorage, loadMessagesFromLocal],
  );

  const handleSessionHistory = useCallback(
    (
      logs: { role: string; content: string; type?: string; data?: unknown }[],
    ) => {
      console.log('📋 Session history received from server:', logs);

      // 로컬스토리지 사용 시에는 서버 히스토리 무시
      if (useLocalStorage) {
        console.log('💾 로컬스토리지 사용 중이므로 서버 히스토리 무시');
        return;
      }

      // 서버 히스토리가 비어있으면 처리하지 않음
      if (!logs || logs.length === 0) {
        console.log('📭 서버 히스토리가 비어있음');
        return;
      }

      const converted: Message[] = logs.map((msg) => {
        // 로그 추가 (각 메시지별로)
        if (msg.type) {
          console.log('🔍 Processing message with type:', msg.type, msg.data);
        }

        // 캐러셀 선택 등 특별한 타입 처리
        if (
          msg.type === 'carousel_select' ||
          msg.type === 'ox_select' ||
          msg.type === 'ott_select'
        ) {
          return { type: 'user', text: msg.content };
        }

        // 새로 추가: function_call 타입 처리
        if (msg.type === 'function_call' && msg.role === 'assistant') {
          console.log('🔧 Function call message detected:', msg.data);

          // data에서 function call 정보 추출
          const functionCallData = msg.data as {
            name?: string;
            args?: unknown;
            selectedItem?: CarouselItem;
            selectedServices?: string[];
            isSelected?: boolean;
          };

          if (functionCallData?.name && functionCallData?.args) {
            const botMessage: Message = {
              type: 'bot',
              messageChunks: [msg.content],
              functionCall: {
                name: functionCallData.name as FunctionCall['name'],
                args: functionCallData.args as FunctionCall['args'],
              },
            };

            // 선택 데이터가 있으면 추가 (OTT와 캐러셀 모두 지원)
            if (functionCallData.isSelected) {
              botMessage.selectedData = {
                selectedItem: functionCallData.selectedItem,
                selectedServices: functionCallData.selectedServices,
                isSelected: functionCallData.isSelected,
              };
              console.log('✅ Selected data loaded:', botMessage.selectedData);
            }

            return botMessage;
          }
        }

        // 기본 처리
        return msg.role === 'user'
          ? { type: 'user', text: msg.content }
          : { type: 'bot', messageChunks: [msg.content] };
      });
      setMessages(converted);
    },
    [useLocalStorage],
  );

  const handleLoading = useCallback(
    (data: { type: 'searching' | 'waiting' | 'dbcalling' }) => {
      setMessages((prev) => [
        ...prev,
        {
          type: 'loading',
          loadingType: data.type,
        },
      ]);
    },
    [],
  );

  const handleLoadingEnd = useCallback(() => {
    setMessages((prev) => prev.filter((msg) => msg.type !== 'loading'));
  }, []);

  const handleCarouselButtons = useCallback((items: CarouselItem[]) => {
    setMessages((prev) => [
      ...prev.filter((msg) => msg.type !== 'loading'),
      {
        type: 'bot',
        messageChunks: [''],
        functionCall: {
          name: 'requestCarouselButtons',
          args: { items },
        },
      },
    ]);
  }, []);

  const handleOXCarouselButtons = useCallback((data: { options: string[] }) => {
    setMessages((prev) => [
      ...prev.filter((msg) => msg.type !== 'loading'),
      {
        type: 'bot',
        messageChunks: [''],
        functionCall: {
          name: 'requestOXCarouselButtons',
          args: { options: data.options },
        },
      },
    ]);
  }, []);

  const handleOTTServiceList = useCallback(
    (data: { question: string; options: string[] }) => {
      setMessages((prev) => [
        ...prev.filter((msg) => msg.type !== 'loading'),
        {
          type: 'bot',
          messageChunks: [''],
          functionCall: {
            name: 'requestOTTServiceList',
            args: { question: data.question, options: data.options },
          },
        },
      ]);
    },
    [],
  );

  const handlePlanLists = useCallback((plans: PlanData[]) => {
    setMessages((prev) => [
      ...prev.filter((msg) => msg.type !== 'loading'),
      {
        type: 'bot',
        messageChunks: [''],
        functionCall: {
          name: 'showPlanLists',
          args: { plans },
        },
      },
    ]);
  }, []);

  const handleTextCard = useCallback(
    (data: {
      title: string;
      description: string;
      url: string;
      buttonText: string;
      imageUrl?: string;
    }) => {
      setMessages((prev) => [
        ...prev.filter((msg) => msg.type !== 'loading'),
        {
          type: 'bot',
          messageChunks: [''],
          functionCall: {
            name: 'requestTextCard',
            args: {
              title: data.title,
              description: data.description,
              url: data.url,
              buttonText: data.buttonText,
              imageUrl: data.imageUrl,
            },
          },
        },
      ]);
    },
    [],
  );

  // 세션 초기화 및 히스토리 로드
  useEffect(() => {
    const existing = localStorage.getItem('sessionId');
    socket.emit('init-session', existing || null);

    const handleFirstCardList = () => {
      setMessages((prev) => [
        ...prev.filter((msg) => msg.type !== 'loading'),
        {
          type: 'bot',
          messageChunks: [''],
          functionCall: {
            name: 'showFirstCardList',
            args: {},
          },
        },
      ]);
    };

    socket.on('session-id', handleSessionId);
    socket.on('session-history', handleSessionHistory);
    socket.on('loading', handleLoading);
    socket.on('loading-end', handleLoadingEnd);
    socket.on('carousel-buttons', handleCarouselButtons);
    socket.on('ox-carousel-buttons', handleOXCarouselButtons);
    socket.on('ott-service-list', handleOTTServiceList);
    socket.on('plan-lists', handlePlanLists);
    socket.on('text-card', handleTextCard);
    socket.on('first-card-list', handleFirstCardList);

    // 제거: 서버에서 더 이상 이벤트를 보내지 않음 (로컬스토리지 사용)
    // socket.on('carousel-selection-updated', ({ messageIndex, selectedItem, isSelected }) => {
    //   console.log('✅ Carousel selection updated:', { messageIndex, selectedItem, isSelected });
    //   setMessages((prev) =>
    //     prev.map((msg, idx) => {
    //       if (idx === messageIndex && msg.type === 'bot') {
    //         return { ...msg, selectedData: { selectedItem, isSelected } };
    //       }
    //       return msg;
    //     }),
    //   );
    // });

    // socket.on('ott-selection-updated', ({ messageIndex, selectedServices, isSelected }) => {
    //   console.log('✅ OTT selection updated:', { messageIndex, selectedServices, isSelected });
    //   setMessages((prev) =>
    //     prev.map((msg, idx) => {
    //       if (idx === messageIndex && msg.type === 'bot') {
    //         return { ...msg, selectedData: { selectedServices, isSelected } };
    //       }
    //       return msg;
    //     }),
    //   );
    // });

    return () => {
      socket.off('session-id', handleSessionId);
      socket.off('session-history', handleSessionHistory);
      socket.off('loading', handleLoading);
      socket.off('loading-end', handleLoadingEnd);
      socket.off('carousel-buttons', handleCarouselButtons);
      socket.off('ox-carousel-buttons', handleOXCarouselButtons);
      socket.off('ott-service-list', handleOTTServiceList);
      socket.off('plan-lists', handlePlanLists);
      socket.off('text-card', handleTextCard);
      socket.off('first-card-list', handleFirstCardList);
      // socket.off('carousel-selection-updated'); // 제거: 더 이상 사용 안 함
      // socket.off('ott-selection-updated'); // 제거: 더 이상 사용 안 함
    };
  }, [
    handleSessionId,
    handleSessionHistory,
    handleCarouselButtons,
    handleOXCarouselButtons,
    handleOTTServiceList,
    handlePlanLists,
    handleTextCard,
  ]);

  // 스트리밍 응답 처리
  useEffect(() => {
    const handleStream = (chunk: string) => {
      responseRef.current += chunk;

      // console.log('📥 Stream chunk:', chunk, responseRef.current);
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.type === 'bot') {
          return [
            ...prev.slice(0, -1),
            { type: 'bot', messageChunks: [responseRef.current] },
          ];
        } else {
          return [
            ...prev,
            { type: 'bot', messageChunks: [responseRef.current] },
          ];
        }
      });
    };

    const handleDone = () => {
      console.log('✅ Stream completed');
      setIsStreaming(false);
    };

    const handleError = (error: ServerError) => {
      console.error('❌ Server error:', error);

      // 타입별 로그 레벨 조정
      if (error.type === 'SESSION_SAVE_ERROR') {
        console.warn('⚠️ Non-critical error:', error);
      } else if (
        error.type === 'OPENAI_API_ERROR' ||
        error.type === 'NETWORK_ERROR'
      ) {
        console.error('🚨 Critical error:', error);
      }

      setIsStreaming(false);

      const userFriendlyMessage = getErrorMessage(error);

      setMessages((prev) => [
        ...prev,
        {
          type: 'bot',
          messageChunks: [userFriendlyMessage],
        },
      ]);

      // 개발 환경에서만 상세 에러 정보 표시
      if (import.meta.env.DEV && error.details) {
        console.group('🔍 Error Details:');
        console.table(error.details);
        console.groupEnd();
      }
    };

    const handleDisconnect = () => {
      console.warn('⚠️ Socket disconnected');
      setIsStreaming(false);
    };

    socket.on('stream', handleStream);
    socket.on('done', handleDone);
    socket.on('error', handleError);
    socket.on('disconnect', handleDisconnect);

    return () => {
      socket.off('stream', handleStream);
      socket.off('done', handleDone);
      socket.off('error', handleError);
      socket.off('disconnect', handleDisconnect);
    };
  }, []);

  // 메시지 전송
  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim() || !sessionId) return;

      const payload = {
        sessionId,
        message: text.trim(),
      };

      setMessages((prev) => [...prev, { type: 'user', text }]);
      setIsStreaming(true);
      responseRef.current = '';

      socket.emit('recommend-plan', payload);
    },
    [sessionId],
  );

  // 제거: 서버에 더 이상 선택 상태를 보내지 않음 (로컬스토리지 사용)
  // const sendCarouselSelection = useCallback((carouselData, selectedItem, isSelected) => {
  //   if (!sessionId) return;
  //   const payload = { sessionId, carouselData, selectedItem, isSelected };
  //   console.log('📤 Sending carousel selection:', payload);
  //   socket.emit('carousel-selection', payload);
  // }, [sessionId]);

  // 로컬 상태에서만 선택 상태 업데이트 (서버에 보내지 않음)
  const updateCarouselSelection = useCallback(
    (messageIndex: number, selectedItem: CarouselItem) => {
      console.log('🔄 로컬에서 캐러셀 선택 상태 업데이트:', {
        messageIndex,
        selectedItem,
      });

      // 로컬 상태만 업데이트
      setMessages((prev) =>
        prev.map((msg, idx) => {
          if (idx === messageIndex && msg.type === 'bot') {
            return {
              ...msg,
              selectedData: { selectedItem, isSelected: true },
            };
          }
          return msg;
        }),
      );
    },
    [],
  );

  // 로컬 상태에서만 OTT 선택 상태 업데이트 (서버에 보내지 않음)
  const updateOttSelection = useCallback(
    (messageIndex: number, selectedServices: string[]) => {
      console.log('🎬 로컬에서 OTT 선택 상태 업데이트:', {
        messageIndex,
        selectedServices,
      });

      // 로컬 상태만 업데이트
      setMessages((prev) =>
        prev.map((msg, idx) => {
          if (idx === messageIndex && msg.type === 'bot') {
            return {
              ...msg,
              selectedData: {
                selectedServices,
                isSelected: selectedServices.length > 0,
              },
            };
          }
          return msg;
        }),
      );
    },
    [],
  );

  // 로컬 상태에서만 OX 선택 상태 업데이트 (서버에 보내지 않음)
  const updateOxSelection = useCallback(
    (messageIndex: number, selectedOption: string) => {
      console.log('🔘 로컬에서 OX 선택 상태 업데이트:', {
        messageIndex,
        selectedOption,
      });

      // 로컬 상태만 업데이트
      setMessages((prev) =>
        prev.map((msg, idx) => {
          if (idx === messageIndex && msg.type === 'bot') {
            return {
              ...msg,
              selectedData: { selectedOption, isSelected: true },
            };
          }
          return msg;
        }),
      );
    },
    [],
  );

  // 메시지가 변경될 때마다 로컬스토리지에 저장
  useEffect(() => {
    if (useLocalStorage && messages.length > 0) {
      saveMessagesToLocal(messages);
    }
  }, [messages, useLocalStorage, saveMessagesToLocal]);

  // 제거: 항상 로컬스토리지 사용으로 토글 불필요

  // 새 채팅 시작
  const startNewChat = useCallback(() => {
    if (!sessionId) return;
    socket.emit('reset-session', { sessionId });
    setMessages([]);
    responseRef.current = '';
  }, [sessionId]);

  return {
    messages,
    isStreaming,
    sessionId,
    isInitialLoading,
    sendMessage,
    updateCarouselSelection,
    updateOttSelection,
    updateOxSelection,
    startNewChat,
  };
};
