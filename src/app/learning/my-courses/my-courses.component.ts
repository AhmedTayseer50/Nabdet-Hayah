import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { Course } from 'src/app/shared/models/course.model';
import { MyCoursesService } from '../services/my-courses.service';

@Component({
  selector: 'app-my-courses',
  templateUrl: './my-courses.component.html',
  styleUrls: ['./my-courses.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyCoursesComponent {
  loading = true;
  error?: string;

  myCourses$: Observable<Course[]> = this.svc.myCourses$();

  constructor(private svc: MyCoursesService) {}
}
