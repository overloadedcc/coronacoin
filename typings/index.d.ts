import EventEmitter from 'events';

/// Params

/**
 * Параметры класса
 */
interface ICoronaCoinParams {
  /**
   * Токен от CoronaCoin
   */
  token: string;

  /**
   * Токен пользователя от VK API, нужен для метода `startPolling`
   */
  userToken: string;
  
  /**
   * Ссылка на polling
   */
  pollingUrl?: string;

  /**
   * Время на ожидание перед переподключением
   */
  reconnectTimeout?: number;
}

/**
 * Параметры для метода `transfer`
 */
interface ITransferParams {
  /**
   * Id получателя
   */
  toId: number;

  /**
   * Количество CoronaCoin
   */
  amount: number
}

/**
 * Параметры для метода `history`
 */
interface IHistoryParams {
  /**
   * * 1 - перевод пользователем
   * * 2 - перевод через API
   */
  type: 1 | 2;

  /**
   * Смещение по id
   */
  offset?: number;
}

/**
 * Параметры метода `getDepositLink`
 */
interface IGetDepositLinkParams {
  /**
   * Id пользователя
   */
  userId: number;

  /**
   * Количество CoronaCoin
   */
  amount: number;

  /**
   * Зафиксирована ли сумма?
   * 
   * _Если `true`, то пользователь не сможет редактировать сумму_
   */
  isFixed: boolean;
}

/// Responses

/**
 * Ответ метода `transfer`
 */
interface ITransferResponse {
  /**
   * Id перевода
   */
  id: number;

  /**
   * Количество CoronaCoin
   */
  amount: number;

  /**
   * Текущий баланс
   */
  current: number;
}

/**
 * Ответ метода `score`
 */
interface IScoreResponseElement {
  /**
   * Id пользователя
   */
  id: number;

  /**
   * Количество CoronaCoin
   */
  coins: number;
}

/**
 * Ответ метода `history`
 */
interface IHistoryResponseElement {
  /**
   * Id перевода
   */
  id: number;

  /**
   * Id отправителя
   */
  from_id: number;

  /**
   * Id получателя
   */
  to_id: number;

  /**
   * Количество CoronaCoin
   */
  amount: number;

  /**
   * * 1 - перевод пользователем
   * * 2 - перевод через API
   */
  type: 1 | 2;

  /**
   * Дата перевода
   */
  time: number;
}

declare class CoronaCoin {
  /**
   * EventEmitter, используется для отлавливания новых пополнений
   */
  public events: EventEmitter;

  public constructor(params: ICoronaCoinParams);

  /**
   * Перевести пользователю CoronaCoin
   */
  public transfer(params?: ITransferParams): Promise<ITransferResponse>;

  /**
   * Получить баланс пользователей по id
   */
  public score(userIds?: Array<number>): Promise<Array<IScoreResponseElement>>;

  /**
   * Получить историю переводов
   */
  public history(params?: IHistoryParams): Promise<Array<IHistoryResponseElement>>;

  /**
   * Получить ссылку на пополнение
   */
  public getDepositLink(params?: IGetDepositLinkParams): string;

  /**
   * Начать polling
   */
  public startPolling(): void;
}

export = CoronaCoin
