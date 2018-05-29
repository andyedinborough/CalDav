using System;
using System.Collections.Generic;
using System.Linq;
using CalCli.API;
using Outlook = Microsoft.Office.Interop.Outlook;

namespace OutlookClient {
	public class OutlookToDo : IToDo{
        Outlook.TaskItem taskItem;

        public ICollection<string> Categories
        {
            get
            {
                return new List<string> { taskItem.Categories };
            }

            set
            {
                taskItem.Categories = "";
                foreach (string category in value)
                {
                    taskItem.Categories += value + ";";
                }

            }
        }

        public DateTime? Completed
        {
            get
            {
                return taskItem.DateCompleted;
            }

            set
            {
                if(value == null)
                    throw new Exception("Completion date cannot be null.");
                taskItem.DateCompleted = (DateTime)value;
            }
        }

        public DateTime? Due
        {
            get
            {
                return taskItem.DueDate;
            }

            set
            {

                if (value == null)
                    throw new Exception("Due cannot be null.");
                taskItem.DueDate = (DateTime)value;
            }
        }

        public int? Priority
        {
            get
            {
                throw new Exception("Not supported for outlook.");
            }

            set
            {
                throw new Exception("Not supported for outlook.");
            }
        }

        public int? Sequence
        {
            get
            {
                return (int)(taskItem.DueDate - taskItem.StartDate).TotalSeconds;
            }

            set
            {
                if(taskItem.DueDate != null && taskItem.StartDate != null)
                {
                    throw new Exception("Dates are already set.");
                }

            }
        }


        public DateTime? Start
        {
            get
            {
                return taskItem.StartDate;
            }

            set
            {
                if (value == null)
                    throw new Exception("Start cannot be null.");
                taskItem.StartDate = (DateTime)value;

            }
        }

        public Statuses? Status
        {
            get
            {
                if (taskItem.Complete)
                    return Statuses.COMPLETED;
                else
                    return Statuses.NEEDS_ACTION;
            }

            set
            {
                taskItem.Complete = value == Statuses.COMPLETED;
            }
        }

        public string Summary
        {
            get
            {
                return taskItem.Subject;
            }

            set
            {
                taskItem.Subject = value;
            }
        }

        public string UID
        {
            get; set;
        }
        public Outlook.TaskItem TaskItem
        {
            get
            {
                return taskItem;
            }
        }

        public OutlookToDo(Outlook.Application app) {
            taskItem = app.CreateItem(Microsoft.Office.Interop.Outlook.OlItemType.olTaskItem);
		}
	}
}
