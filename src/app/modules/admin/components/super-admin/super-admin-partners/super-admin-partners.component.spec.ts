import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {SuperAdminPartnersComponent} from './super-admin-partners.component';

describe('SuperAdminPartnersComponent', () => {
    let component: SuperAdminPartnersComponent;
    let fixture: ComponentFixture<SuperAdminPartnersComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SuperAdminPartnersComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SuperAdminPartnersComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
