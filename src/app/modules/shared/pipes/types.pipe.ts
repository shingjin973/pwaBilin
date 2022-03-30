import {TransactionType, TransactionValueType} from '../../../interfaces/transactions';
import {UserType} from '../../../interfaces/user';
import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'usertype'
})
export class UsertypePipe implements PipeTransform {
    transform(value: UserType, args?: any): any {
        switch (value) {
            case UserType.Teacher:
                return 'Teacher';
            case UserType.SchoolAdmin:
                return 'School Admin';
            case UserType.Student:
                return 'Student';
            case UserType.UnApprovedTeacher:
                return 'Teacher (pending)';
            case UserType.SuperAdmin:
                return 'Super Admin';
            default:
                return 'unknown';
        }
    }
}

@Pipe({
    name: 'transactiontype'
})
export class TransactiontypePipe implements PipeTransform {
    transform(value: TransactionType): string {
        switch (value) {
            case TransactionType.All: {
                return 'All';
            }
            case TransactionType.Enrollment: {
                return 'Enrollment';
            }
            case TransactionType.CancelEnrollment: {
                return 'Cancel enrollment';
            }
            case TransactionType.CompleteEnrollment: {
                return 'Complete enrollment';
            }
            case TransactionType.PurchaseInternalCredit: {
                return 'Purchase (credits)';
            }
            case TransactionType.PurchaseCurrency: {
                return 'Purchase (currency)';
            }
            case TransactionType.AdminModification: {
                return 'Admin modification';
            }
        }
    }
}

@Pipe({
    name: 'transactionvaluetype'
})
export class TransactionvaluetypePipe implements PipeTransform {
    transform(value: TransactionValueType): string {
        switch (value) {
            case TransactionValueType.InternalCredit: {
                return 'credits';
            }
            case TransactionValueType.USD: {
                return '$';
            }
            case TransactionValueType.RMB: {
                return '¥';
            }
        }
    }
}
