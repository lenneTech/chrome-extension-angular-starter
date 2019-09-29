import { DataType } from '../enums/data-type.enum';

/**
 * Data model
 */
export class Data {
  id?: string;
  type: DataType;
  value: any;
}
