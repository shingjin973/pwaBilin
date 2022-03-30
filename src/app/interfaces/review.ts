import { ReviewType } from './enums';

export interface Review{
  _id?: string;
  from?: string;
  from_showname?: string;
  to?: string;
  message?: string;
  date?: Date;
  stars?: string;
  auto_id?: number;
  type?: ReviewType;
}
