import { User } from './user';
import { Observable } from 'rxjs';

export interface Payment{
  auto_id?: number;
  id?: string;

  credits?: Number;
  create_time?: Date;
  paypal_id: string;
  payer_id: string;
  payer_email_address: string;
  status: string;
  update_time: Date;
  amount: string;
  currency: string;

  user?: User | Observable<User>;
  user_id?: string;
}

export enum TransactionType{
  All = 0,
  Enrollment = 1,
  CancelEnrollment = 2,
  CompleteEnrollment = 3,
  PurchaseInternalCredit = 4,
  PurchaseCurrency = 5,
  AdminModification = 6
}

export enum TransactionValueType{
  InternalCredit = 1,
  USD = 2,
  RMB = 3
}

export enum TransactionUserType{
  System = 0
}

export interface Transaction{
  auto_id?: number;
  date?: string;
  debit_user: string | TransactionUserType | User;
  debit_type: TransactionValueType;
  debit_amount: number;
  credit_user: string | TransactionUserType | User;
  credit_type: TransactionValueType;
  credit_amount: number;
  type: TransactionType;
  notes: string;

  payment_id?: string; // only for paypal payments
}
