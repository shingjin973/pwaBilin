import { ToastrService } from 'ngx-toastr';
import { DataService } from 'src/app/services/data.service';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Material } from 'src/app/interfaces/course';
import * as _ from 'lodash';

@Component({
  selector: 'app-material',
  templateUrl: './material.component.html',
  styleUrls: ['./material.component.scss']
})
export class MaterialComponent {
  material: Material;

  constructor(
    private route: ActivatedRoute,
    private data: DataService,
    private toastr: ToastrService
  ) {
    this.route.params.subscribe(({materialid}) => {
      if(materialid){
        this.getData(materialid)
      }
    })
   }

  getData(id){
    this.data.getMaterial(id).subscribe((res) => {
      this.material = res ? res.data : null;
    })
  }

  async removeMaterialsFromSession(course_id: string, lesson_id: string, session_id: string){
    this.data.getLesson(course_id, lesson_id).subscribe(async (res) => {
      if(res && res.data){
        const session = _.find(res.data.sessions, {_id: session_id});

        if(!session){
          return this.toastr.error('Oops.. Something went wrong.');
        }

        const materials = _.filter(Array.prototype.slice.call(session.materials || []), v => v !== this.material._id);

        await this.data.updateLessonSession(course_id, lesson_id, session_id, {materials}).toPromise();

        this.getData(this.material._id)
      }
    })
  }

}
