import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArtisteFormComponent } from './artiste-form.component';

describe('ArtisteFormComponent', () => {
  let component: ArtisteFormComponent;
  let fixture: ComponentFixture<ArtisteFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtisteFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArtisteFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
