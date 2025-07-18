import { extractMetadata } from '../utils/metadataExtractor.js';
import { handleFunctionError } from './gptErrorHandler.js';
import { searchPlansFromDB } from './gptFuncDefinitions.js';
import {
  ErrorType,
  SocketEvent,
  OTTServices,
  OXOptions,
  LoadingType,
} from '../utils/constants.js';

/**
 * 함수 인자를 JavaScript 객체나 JSON으로 파싱합니다.
 * @param {string} functionArgsRaw - 원시 함수 인자 문자열
 * @returns {Object} 파싱된 인자 객체
 */
const parseFunctionArgs = (functionArgsRaw) => {
  if (!functionArgsRaw) return {};

  try {
    // JavaScript 객체 형식을 JSON으로 변환
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

    return JSON.parse(fixedJson);
  } catch (secondParseError) {
    // eval 방식으로 재시도
    try {
      console.warn('🔄 eval 방식으로 재시도...');
      return eval(`(${functionArgsRaw})`);
    } catch (evalError) {
      console.error('❌ 최종 JSON 파싱 실패:', secondParseError);
      console.error('❌ eval 방식도 실패:', evalError);
      console.log('🔍 원본:', functionArgsRaw);
      throw new Error('Function arguments 파싱에 실패했습니다.');
    }
  }
};

/**
 * 각 함수별 처리 로직을 실행합니다.
 * @param {string} functionName - 호출할 함수 이름
 * @param {Object} args - 함수 인자
 * @param {Socket} socket - 소켓 객체
 * @returns {Object} 함수 실행 결과
 */
export const executeFunctionCall = async (functionName, args, socket) => {
  switch (functionName) {
    case 'requestOTTServiceList': {
      socket.emit(SocketEvent.LOADING_END);
      socket.emit(SocketEvent.OTT_SERVICE_LIST, {
        question: '어떤 OTT 서비스를 함께 사용 중이신가요?',
        options: OTTServices,
      });
      return { success: true, functionName, result: 'OTT 서비스 선택지 제공' };
    }

    case 'requestOXCarouselButtons': {
      socket.emit(SocketEvent.LOADING_END);
      socket.emit(SocketEvent.OX_CAROUSEL_BUTTONS, {
        options: OXOptions,
      });
      break;
    }

    case 'requestCarouselButtons': {
      const { items } = args;
      if (!items) {
        handleFunctionError(
          ErrorType.MISSING_FUNCTION_ARGS,
          'requestCarouselButtons에 필요한 items가 없습니다.',
          { functionName, args },
          socket,
        );
        return;
      }
      socket.emit(SocketEvent.LOADING_END);
      socket.emit(SocketEvent.CAROUSEL_BUTTONS, items);
      break;
    }

    case 'searchPlans': {
      console.log('🔍 searchPlans 함수 호출됨:', args);

      socket.emit(SocketEvent.LOADING, {
        type: functionName?.includes('Plan')
          ? LoadingType.DB_CALLING
          : LoadingType.SEARCHING,
        functionName: functionName,
      });
      try {
        // MongoDB에서 조건에 맞는 요금제 검색
        const result = await searchPlansFromDB(args);
        const { plans } = result;

        console.log(`📋 검색된 요금제 수: ${plans.length}개`);

        if (plans.length === 0) {
          console.warn('⚠️ 조건에 맞는 요금제가 없습니다.');
          // 검색 결과가 없어도 빈 배열을 전송
          socket.emit(SocketEvent.LOADING_END);
          socket.emit(SocketEvent.PLAN_LISTS, []);
          return {
            success: true,
            functionName,
            result: 'empty',
            plansCount: 0,
          };
        } else {
          // 검색된 요금제를 클라이언트에 전송
          socket.emit(SocketEvent.LOADING_END);
          socket.emit(SocketEvent.PLAN_LISTS, plans);
          return {
            success: true,
            functionName,
            result: 'found',
            plansCount: plans.length,
            planNames: plans.map((p) => p.name),
          };
        }
      } catch (dbError) {
        console.error('❌ DB 조회 실패:', dbError);
        // 에러 발생 시에도 로딩 종료
        socket.emit(SocketEvent.LOADING_END);
        handleFunctionError(
          ErrorType.FUNCTION_EXECUTION_ERROR,
          '요금제 검색 중 오류가 발생했습니다.',
          { functionName, args, error: dbError.message },
          socket,
        );
        return { success: false, functionName, error: dbError.message };
      }
      break;
    }

    case 'showPlanLists': {
      const { plans } = args;
      if (!plans) {
        handleFunctionError(
          ErrorType.MISSING_FUNCTION_ARGS,
          'showPlanLists에 필요한 plans가 없습니다.',
          { functionName, args },
          socket,
        );
        return;
      }
      socket.emit(SocketEvent.LOADING_END);
      socket.emit(SocketEvent.PLAN_LISTS, plans);
      break;
    }

    case 'requestTextCard': {
      const { title, description, url, buttonText, imageUrl } = args;
      if (!title || !description || !url || !buttonText) {
        handleFunctionError(
          ErrorType.MISSING_FUNCTION_ARGS,
          'requestTextCard에 필요한 title, description, url, buttonText가 없습니다.',
          { functionName, args },
          socket,
        );
        return;
      }

      // imageUrl이 없으면 URL에서 메타데이터 추출
      let finalImageUrl = await extractMetadata(url);
      console.log('📸 추출된 이미지 URL:', finalImageUrl);

      socket.emit(SocketEvent.LOADING_END);
      socket.emit(SocketEvent.TEXT_CARD, {
        title,
        description,
        url,
        buttonText,
        imageUrl: finalImageUrl,
      });
      break;
    }

    case 'showFirstCardList': {
      socket.emit(SocketEvent.LOADING_END);
      socket.emit(SocketEvent.FIRST_CARD_LIST);
      break;
    }

    default:
      handleFunctionError(
        ErrorType.UNKNOWN_FUNCTION,
        `알 수 없는 function: ${functionName}`,
        { functionName, args },
        socket,
      );
      return { success: false, functionName, error: 'Unknown function' };
  }
};

/**
 * 함수 호출을 처리합니다.
 * @param {string} functionName - 함수 이름
 * @param {string} functionArgsRaw - 원시 함수 인자
 * @param {Socket} socket - 소켓 객체
 */
export const handleFunctionCall = async (
  functionName,
  functionArgsRaw,
  socket,
) => {
  try {
    const args = parseFunctionArgs(functionArgsRaw);

    const result = await executeFunctionCall(functionName, args, socket);
    return result;
  } catch (functionError) {
    console.error(`Function call 처리 실패 (${functionName}):`, functionError);

    if (functionError.message === 'Function arguments 파싱에 실패했습니다.') {
      handleFunctionError(
        ErrorType.FUNCTION_ARGS_PARSE_ERROR,
        'Function arguments 파싱에 실패했습니다.',
        {
          functionName,
          rawArgs: functionArgsRaw,
          parseError: functionError.message,
        },
        socket,
      );
    } else {
      handleFunctionError(
        ErrorType.FUNCTION_EXECUTION_ERROR,
        '기능 처리 중 오류가 발생했습니다.',
        {
          functionName,
          args: functionArgsRaw,
          error: functionError.message,
        },
        socket,
      );
      return { success: false, functionName, error: functionError.message };
    }
  }
};
