import { ActionType } from '../enums/action-type.enum';
import { Data } from './data.model';

/**
 * Message model
 */
export class Message {
  action: ActionType;
  data: Data;
}
