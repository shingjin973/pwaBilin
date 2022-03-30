import { Lesson } from "../../../../../../interfaces/course";
// import { Component, Input} from "@angular/core";
import { Router } from "@angular/router";
import { Component, Input, Output, EventEmitter } from "@angular/core";

@Component({
  selector: "app-single-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.scss"],
})
export class SidebarComponent {
  @Output("showUsImage") showUsImage: EventEmitter<any> = new EventEmitter();
  @Output("showCnImage") showCnImage: EventEmitter<any> = new EventEmitter();
  @Output("downUsImage") downUsImage: EventEmitter<any> = new EventEmitter();
  @Output("downCsImage") downCsImage: EventEmitter<any> = new EventEmitter();
  @Input("lesson") lesson: Lesson; 
  @Input("promoter") promoter: Boolean; 
  @Input("showSections") showSections: boolean = true;
  constructor(private router: Router) {}
  showUS(){
    this.showUsImage.emit();  
  }
  showCN(){
    this.showCnImage.emit();  
  }
  downUS(){
    this.downUsImage.emit();  
  }
  downCN(){
    this.downCsImage.emit();  
  }
  navigate(url) {
    this.router.navigate([url]);
  }
}
