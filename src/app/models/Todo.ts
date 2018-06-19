import { Observable } from "rxjs";
import { TableObject, GetAllTableObjects, SaveTableObject, GetTableObject } from 'dav-npm';
import { environment } from "../../environments/environment";

export class Todo{
   constructor(public uuid: string, 
               public completed: boolean, 
               public time: number, 
               public name: string){}

   SetCompleted(completed: boolean){
      if(this.completed != completed){
         this.completed = completed;
         this.Save();
      }
   }

   private async Save(){
      var tableObject = await GetTableObject(this.uuid);
      if(tableObject){
         tableObject.Properties[environment.todoNameKey] = this.name;
         tableObject.Properties[environment.todoCompletedKey] = this.completed.toString();
         tableObject.Properties[environment.todoTimeKey] = this.time.toString();
         SaveTableObject(tableObject);
      }
	}
	
	Delete(){
		
	}
}

export function GetAllTodos(): Observable<Todo>{
   return new Observable<Todo>((observer: any) => {
      GetAllTableObjects().forEach((tableObject: TableObject) => {
         if(tableObject.TableId != environment.todoTableId){
            return;
         }

         var completed: boolean = (tableObject.Properties[environment.todoCompletedKey] === 'true' || 
                                    tableObject.Properties[environment.todoCompletedKey] === 'True')
         
         var todoTime: number = 0;
         var tableObjectTodoTime = tableObject.Properties[environment.todoTimeKey];
         if(tableObjectTodoTime){
            todoTime = Number.parseInt(tableObjectTodoTime);
         }

         var todo = new Todo(tableObject.Uuid, completed, todoTime, tableObject.Properties[environment.todoNameKey]);

         observer.next(todo)
         return;
      });
   });
}

export function CreateTodo(todo: Todo): string{
   var tableObject = new TableObject();
   tableObject.TableId = environment.todoTableId;
	tableObject.Properties.add(environment.todoCompletedKey, todo.completed.toString());
	tableObject.Properties.add(environment.todoTimeKey, todo.time.toString());
	tableObject.Properties.add(environment.todoNameKey, todo.name);

	SaveTableObject(tableObject);
	return tableObject.Uuid;
}