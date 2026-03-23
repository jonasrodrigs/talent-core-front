import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TalentTableComponent } from './talent-table.component';

describe('TalentTableComponent', () => {
  let component: TalentTableComponent;
  let fixture: ComponentFixture<TalentTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TalentTableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TalentTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
