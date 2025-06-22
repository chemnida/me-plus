import dotenv from 'dotenv';
import OpenAI from 'openai';
import axios from 'axios';
import * as cheerio from 'cheerio';

dotenv.config();

export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 메타데이터 추출 함수
const extractMetadata = async (url) => {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      maxRedirects: 5,
    });

    const html = response.data;
    const $ = cheerio.load(html);

    const getMetaContent = (selector) => {
      const element = $(selector);
      return element.attr('content') || element.text() || null;
    };

    let imageUrl =
      getMetaContent('meta[property="og:image"]') ||
      getMetaContent('meta[name="twitter:image"]') ||
      null;

    // 상대 URL을 절대 URL로 변환
    if (imageUrl && !imageUrl.startsWith('http')) {
      const validUrl = new URL(url);
      if (imageUrl.startsWith('//')) {
        imageUrl = validUrl.protocol + imageUrl;
      } else if (imageUrl.startsWith('/')) {
        imageUrl = validUrl.origin + imageUrl;
      } else {
        imageUrl = validUrl.origin + '/' + imageUrl;
      }
    }

    return imageUrl;
  } catch (error) {
    console.warn('메타데이터 추출 실패:', error.message);
    return null;
  }
};

export const streamChat = async (
  messages,
  socket,
  onDelta,
  onFunctionCall = null,
) => {
  try {
    // 타임아웃 설정 (30초)
    const timeoutMs = 30000;
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('REQUEST_TIMEOUT')), timeoutMs);
    });

    const streamPromise = openai.chat.completions.create({
      model: 'gpt-4.1-mini-2025-04-14',
      messages,
      stream: true,
      tools: [
        {
          type: 'function',
          function: {
            name: 'requestOTTServiceList',
            description:
              '유저에게 통신사와 연결된 OTT 서비스 목록을 선택하도록 응답 받습니다.',
            parameters: { type: 'object', properties: {} },
          },
        },
        {
          type: 'function',
          function: {
            name: 'requestOXCarouselButtons',
            description:
              '유저에게 예/아니오로만 대답할 수 있는 선택지를 캐러셀 형태로 제공합니다.',
            parameters: { type: 'object', properties: {} },
          },
        },
        {
          type: 'function',
          function: {
            name: 'requestCarouselButtons',
            description:
              '유저에게 짧은 키워드나 명사형 선택지를 가로 스크롤 캐러셀 형태로 제공합니다. 통신사명, 요금대, 데이터량, 기술(5G/LTE) 등 단순한 카테고리 선택에 사용합니다.',
            parameters: {
              type: 'object',
              properties: {
                items: {
                  type: 'array',
                  description: '캐러셀 버튼으로 보여줄 항목 리스트',
                  items: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'string',
                        description: '항목 고유 ID 또는 태그',
                      },
                      label: {
                        type: 'string',
                        description: '버튼에 보여질 텍스트',
                      },
                    },
                    required: ['id', 'label'],
                  },
                },
              },
              required: ['items'],
            },
          },
        },
        {
          type: 'function',
          function: {
            name: 'showPlanLists',
            description:
              '유저에게 여러 요금제 상세 정보를 카드 형식으로 제공합니다. 보통 3개 이상의 요금제를 추천할 때 사용합니다.',
            parameters: {
              type: 'object',
              properties: {
                plans: {
                  type: 'array',
                  description: '추천할 요금제 목록',
                  items: {
                    type: 'object',
                    properties: {
                      _id: { type: 'string', description: '요금제 고유 ID' },
                      category: {
                        type: 'string',
                        description: '요금제 카테고리 (5G, LTE 등)',
                      },
                      name: { type: 'string', description: '요금제 이름' },
                      description: {
                        type: 'string',
                        description: '요금제 설명',
                      },
                      isPopular: {
                        type: 'boolean',
                        description: '인기 요금제 여부',
                      },
                      dataGb: {
                        type: 'number',
                        description: '기본 데이터 제공량 (-1은 무제한)',
                      },
                      sharedDataGb: {
                        type: 'number',
                        description: '공유/테더링 데이터 (GB)',
                      },
                      voiceMinutes: {
                        type: 'number',
                        description: '음성통화 시간 (-1은 무제한)',
                      },
                      addonVoiceMinutes: {
                        type: 'number',
                        description: '추가 음성통화 시간',
                      },
                      smsCount: {
                        type: 'number',
                        description: 'SMS 개수 (-1은 무제한)',
                      },
                      monthlyFee: { type: 'number', description: '월 요금' },
                      optionalDiscountAmount: {
                        type: 'number',
                        description: '최대 할인 가능 금액',
                      },
                      ageGroup: {
                        type: 'string',
                        description: '대상 연령대 (ALL, YOUTH 등)',
                      },
                      detailUrl: {
                        type: 'string',
                        description: '자세히 보기 링크 URL',
                      },
                      bundleBenefit: {
                        type: ['string', 'null'],
                        description: '결합 할인 정보',
                      },
                      mediaAddons: {
                        type: ['string', 'null'],
                        description: '미디어 부가서비스',
                      },
                      premiumAddons: {
                        type: ['string', 'null'],
                        description: '프리미엄 부가서비스',
                      },
                      basicService: {
                        type: 'string',
                        description: '기본 제공 서비스',
                      },
                    },
                    required: [
                      '_id',
                      'category',
                      'name',
                      'description',
                      'isPopular',
                      'dataGb',
                      'sharedDataGb',
                      'voiceMinutes',
                      'addonVoiceMinutes',
                      'smsCount',
                      'monthlyFee',
                      'optionalDiscountAmount',
                      'ageGroup',
                      'detailUrl',
                      'basicService',
                    ],
                  },
                },
              },
              required: ['plans'],
            },
          },
        },
        {
          type: 'function',
          function: {
            name: 'requestTextCard',
            description:
              '유저에게 특정 웹사이트나 링크로 안내할 때 사용합니다. URL의 미리보기 이미지와 함께 카드 형태로 보여줍니다. 유플러스 사이트나 추천하는 외부 링크를 안내할 때 사용합니다.',
            parameters: {
              type: 'object',
              properties: {
                title: {
                  type: 'string',
                  description: '카드에 표시될 제목',
                },
                description: {
                  type: 'string',
                  description: '카드에 표시될 설명 텍스트',
                },
                url: {
                  type: 'string',
                  description: '안내할 링크 URL',
                },
                buttonText: {
                  type: 'string',
                  description:
                    '버튼에 표시될 텍스트 (예: "자세히 보기", "사이트 방문하기")',
                },
                imageUrl: {
                  type: 'string',
                  description: '카드에 표시될 이미지 URL (선택사항)',
                },
              },
              required: ['title', 'description', 'url', 'buttonText'],
            },
          },
        },
      ],
    });

    const streamRes = await Promise.race([streamPromise, timeoutPromise]);

    let isFunctionCalled = false;
    let functionName = '';
    let functionArgsRaw = '';
    let accumulatedContent = ''; // 텍스트 누적용

    for await (const chunk of streamRes) {
      const delta = chunk.choices[0].delta;

      // tool_calls 감지 (새로운 API 형식)
      if (delta.tool_calls && delta.tool_calls.length > 0) {
        // console.log('🛠️ Tool calls detected:', delta.tool_calls);

        // 처음 tool_calls 감지 시 로딩 시작
        if (!isFunctionCalled) {
          isFunctionCalled = true;

          // Function calling 시작 - 로딩 상태 emit
          const toolCall = delta.tool_calls[0];
          const detectedFunctionName = toolCall.function?.name || 'unknown';
          socket.emit('loading', {
            type: detectedFunctionName.includes('Plan')
              ? 'dbcalling'
              : 'searching',
            functionName: detectedFunctionName,
          });
          console.log('🔄 로딩 시작:', detectedFunctionName);
        }

        const toolCall = delta.tool_calls[0];

        if (toolCall.function?.name) {
          functionName = toolCall.function.name;
          // console.log('🎯 Function name detected:', functionName);
        }

        if (toolCall.function?.arguments) {
          functionArgsRaw += toolCall.function.arguments;
          // console.log('📝 Adding args chunk:', toolCall.function.arguments);
        }
        continue;
      }
      // console.log('🔍 delta:', delta);

      // delta 구조 상세 확인
      if (delta.tool_calls) {
        console.log('✅ tool_calls 존재:', delta.tool_calls);
      }
      if (delta.function_call) {
        console.log('✅ function_call 존재:', delta.function_call);
      }

      // 일반 메시지 content
      const content = delta?.content;
      if (content) {
        accumulatedContent += content;

        // 텍스트에서 function call 패턴 감지 (더 엄격한 패턴)
        const functionCallMatch = accumulatedContent.match(
          /functions?\.(\w+)\s*\(\s*\{([\s\S]*?)\}\s*\)\s*$/,
        );

        if (functionCallMatch) {
          console.log(
            '🔍 Text-based function call detected:',
            functionCallMatch[0],
          );

          // function call 부분을 제거한 텍스트만 전송
          const cleanContent = accumulatedContent
            .replace(/functions?\.(\w+)\s*\(\s*\{[\s\S]*?}\s*\)\s*$/, '')
            .trim();

          // 스트리밍 종료 신호 먼저 전송
          socket.emit('done');

          // function call 실행
          isFunctionCalled = true;
          functionName = functionCallMatch[1];

          // 텍스트 기반 function call 감지 시 로딩 시작
          socket.emit('loading', {
            type: functionName.includes('Plan') ? 'dbcalling' : 'searching',
            functionName: functionName,
          });
          console.log('🔄 텍스트 기반 로딩 시작:', functionName);

          try {
            functionArgsRaw = `{${functionCallMatch[2]}}`;
          } catch (e) {
            console.error('❌ Failed to parse function args from text:', e);
          }

          break; // 스트리밍 종료
        } else {
          // function call이 시작되는 패턴 감지 (전송 중단)
          if (
            accumulatedContent.includes('functions.') ||
            accumulatedContent.includes('function.')
          ) {
            // function call이 완성되기를 기다리므로 전송하지 않음
            // console.log(
            //   '🔍 Function call 시작 감지, 스트리밍 중단:',
            //   accumulatedContent.substring(
            //     accumulatedContent.lastIndexOf('function'),
            //   ),
            // );
          } else {
            // "functions" 또는 "function" 단어만 있는 경우 체크
            if (
              accumulatedContent.includes(' functions') ||
              accumulatedContent.includes(' function') ||
              accumulatedContent.endsWith('functions') ||
              accumulatedContent.endsWith('function')
            ) {
              // 다음 청크를 기다려서 완전한 function call인지 확인
              console.log('🔍 Function 키워드 감지, 다음 청크 대기 중...');
            } else {
              // 정상 텍스트 전송
              socket.emit('stream', content);
              onDelta?.(content);
            }
          }
        }
      }
    }

    if (isFunctionCalled) {
      try {
        console.log('🔧 Function called:', functionName);
        console.log('📄 Raw arguments:', functionArgsRaw);

        // 로딩 시작은 이미 tool_calls 감지 시 처리됨 (제거)

        let args = {};
        if (functionArgsRaw) {
          try {
            // JavaScript 객체 형식을 JSON으로 변환 (더 정교한 변환)
            let fixedJson = functionArgsRaw
              // 1. 키에 따옴표 추가 (단어로 시작하는 키들만)
              .replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":')
              // 2. 작은따옴표를 큰따옴표로 변환
              .replace(/'/g, '"')
              // 3. 숫자 뒤의 불필요한 소수점 제거 (-1.0 → -1)
              .replace(/(-?\d+)\.0(?=[,\s\]\}])/g, '$1')
              // 4. 줄바꿈과 연속된 공백 정리
              .replace(/\n\s*/g, ' ')
              .replace(/\s+/g, ' ')
              .trim();

            console.log(
              '🔄 변환 시도 (처음 200자):',
              fixedJson.substring(0, 200) + '...',
            );
            args = JSON.parse(fixedJson);
            console.log('✅ JavaScript 객체 → JSON 변환 성공');
          } catch (secondParseError) {
            // 더 강력한 방법: eval 사용 (보안상 주의 필요하지만 서버에서만 사용)
            try {
              console.warn('🔄 eval 방식으로 재시도...');
              args = eval(`(${functionArgsRaw})`);
              console.log('✅ eval 방식으로 변환 성공');
            } catch (evalError) {
              console.error('❌ 최종 JSON 파싱 실패:', secondParseError);
              console.error('❌ eval 방식도 실패:', evalError);
              console.log('🔍 원본:', functionArgsRaw);
              console.log('🔍 변환 시도:', fixedJson);

              // 로딩 종료
              socket.emit('loading-end');

              // JSON 파싱 실패 에러를 클라이언트에게 전송
              socket.emit('error', {
                type: 'FUNCTION_ARGS_PARSE_ERROR',
                message: 'Function arguments 파싱에 실패했습니다.',
                details: {
                  functionName,
                  rawArgs: functionArgsRaw,
                  parseError: secondParseError.message,
                },
              });
              return;
            }
          }
        }

        switch (functionName) {
          case 'requestOTTServiceList': {
            socket.emit('loading-end');
            socket.emit('ott-service-list', {
              question: '어떤 OTT 서비스를 함께 사용 중이신가요?',
              options: ['넷플릭스', '디즈니+', '티빙', '왓챠'],
            });
            break;
          }

          case 'requestOXCarouselButtons': {
            socket.emit('loading-end');
            socket.emit('ox-carousel-buttons', {
              options: ['예', '아니오'],
            });
            break;
          }

          case 'requestCarouselButtons': {
            const { items } = args;
            if (!items) {
              socket.emit('loading-end');
              socket.emit('error', {
                type: 'MISSING_FUNCTION_ARGS',
                message: 'requestCarouselButtons에 필요한 items가 없습니다.',
                details: { functionName, args },
              });
              return;
            }

            // 새로 추가: function call 정보 수집
            const functionCallInfo = {
              name: functionName,
              args: { items },
            };

            // onFunctionCall 콜백이 있으면 호출 (안전하게)
            if (onFunctionCall && typeof onFunctionCall === 'function') {
              try {
                onFunctionCall(functionCallInfo);
              } catch (callbackError) {
                console.error('❌ onFunctionCall error:', callbackError);
              }
            }

            socket.emit('loading-end');
            socket.emit('carousel-buttons', items);
            break;
          }

          case 'showPlanLists': {
            const { plans } = args;
            if (!plans) {
              socket.emit('loading-end');
              socket.emit('error', {
                type: 'MISSING_FUNCTION_ARGS',
                message: 'showPlanLists에 필요한 plans가 없습니다.',
                details: { functionName, args },
              });
              return;
            }
            socket.emit('loading-end');
            socket.emit('plan-lists', plans);
            break;
          }

          case 'requestTextCard': {
            const { title, description, url, buttonText, imageUrl } = args;
            if (!title || !description || !url || !buttonText) {
              socket.emit('loading-end');
              socket.emit('error', {
                type: 'MISSING_FUNCTION_ARGS',
                message:
                  'requestTextCard에 필요한 title, description, url, buttonText가 없습니다.',
                details: { functionName, args },
              });
              return;
            }
            socket.emit('loading-end');

            // imageUrl이 없으면 URL에서 메타데이터 추출
            let finalImageUrl = imageUrl;
            if (!finalImageUrl) {
              console.log('🔍 URL에서 메타데이터 추출 중:', url);
              finalImageUrl = await extractMetadata(url);
              console.log('📸 추출된 이미지 URL:', finalImageUrl);
            }

            socket.emit('text-card', {
              title,
              description,
              url,
              buttonText,
              imageUrl: finalImageUrl,
            });
            break;
          }

          case 'showFirstCardList': {
            socket.emit('loading-end');
            socket.emit('first-card-list');
            break;
          }

          default:
            socket.emit('loading-end');
            socket.emit('error', {
              type: 'UNKNOWN_FUNCTION',
              message: `알 수 없는 function: ${functionName}`,
              details: { functionName, args },
            });
        }
      } catch (functionError) {
        console.error(
          `Function call 처리 실패 (${functionName}):`,
          functionError,
        );
        socket.emit('loading-end');
        socket.emit('error', {
          type: 'FUNCTION_EXECUTION_ERROR',
          message: '기능 처리 중 오류가 발생했습니다.',
          details: {
            functionName,
            args,
            error: functionError.message,
          },
        });
      }
    }

    // function call이 처리되지 않은 경우에만 done 신호 전송
    if (!isFunctionCalled) {
      // function call 시작 패턴이 있지만 완성되지 않은 경우 처리
      if (
        accumulatedContent.includes('functions.') ||
        accumulatedContent.includes('function.') ||
        accumulatedContent.includes(' functions') ||
        accumulatedContent.includes(' function') ||
        accumulatedContent.endsWith('functions') ||
        accumulatedContent.endsWith('function')
      ) {
        console.warn(
          '⚠️ 불완전한 function call 감지:',
          accumulatedContent.substring(
            Math.max(0, accumulatedContent.lastIndexOf('function') - 20),
          ),
        );

        // 불완전한 function call 부분 제거 후 전송
        const cleanedContent = accumulatedContent
          .replace(/\s*functions?\s*$/, '')
          .replace(/\s*function\s*$/, '')
          .trim();

        if (cleanedContent) {
          socket.emit('stream', cleanedContent);
        }
      }

      socket.emit('done');
    }
  } catch (error) {
    console.error('❌ GPT Service Error:', error);

    // 타임아웃 에러
    if (error.message === 'REQUEST_TIMEOUT') {
      socket.emit('error', {
        type: 'REQUEST_TIMEOUT',
        message: '⏱️ 응답 시간이 초과되었습니다. 다시 시도해주세요.',
        details: {
          timeout: '30초',
          message: error.message,
        },
      });
    }
    // OpenAI API 관련 에러
    else if (error.response) {
      socket.emit('error', {
        type: 'OPENAI_API_ERROR',
        message: 'AI 서비스 연결에 문제가 발생했습니다.',
        details: {
          status: error.response.status,
          statusText: error.response.statusText,
          message: error.message,
        },
      });
    }
    // 네트워크 에러
    else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      socket.emit('error', {
        type: 'NETWORK_ERROR',
        message: '네트워크 연결에 문제가 발생했습니다.',
        details: {
          code: error.code,
          message: error.message,
        },
      });
    }
    // 스트리밍 에러
    else if (error.name === 'AbortError') {
      socket.emit('error', {
        type: 'STREAM_ABORTED',
        message: '스트리밍이 중단되었습니다.',
        details: {
          message: error.message,
        },
      });
    }
    // 기타 에러
    else {
      socket.emit('error', {
        type: 'UNKNOWN_ERROR',
        message: '예상치 못한 오류가 발생했습니다.',
        details: {
          message: error.message,
          stack: error.stack,
        },
      });
    }
  }
};
