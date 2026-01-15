import { Pipe, PipeTransform } from '@angular/core';
import { Course } from 'src/app/shared/models/course.model';

@Pipe({
  name: 'searchCourses'
})
export class SearchCoursesPipe implements PipeTransform {

  transform(courses: Course[], search: string): Course[] {
    if (!search) return courses;

    search = search.trim().toLowerCase();

    return courses.filter(c =>
      c.title.toLowerCase().includes(search) ||
      c.description.toLowerCase().includes(search)
    );
  }

}
