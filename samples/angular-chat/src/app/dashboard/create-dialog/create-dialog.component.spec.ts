import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {CreateDialogComponent} from './create-dialog.component';

describe('OnlineUsersComponent', () => {
  let component: CreateDialogComponent;
  let fixture: ComponentFixture<CreateDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CreateDialogComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
