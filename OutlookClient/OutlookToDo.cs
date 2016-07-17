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
                throw new NotImplementedException();
            }

            set
            {
                throw new NotImplementedException();
            }
        }

        public DateTime? Due
        {
            get
            {
                throw new NotImplementedException();
            }

            set
            {
                throw new NotImplementedException();
            }
        }

        public int? Priority
        {
            get
            {
                throw new NotImplementedException();
            }

            set
            {
                throw new NotImplementedException();
            }
        }

        public int? Sequence
        {
            get
            {
                throw new NotImplementedException();
            }

            set
            {
                throw new NotImplementedException();
            }
        }

        public DateTime? Start
        {
            get
            {
                throw new NotImplementedException();
            }

            set
            {
                throw new NotImplementedException();
            }
        }

        public Statuses? Status
        {
            get
            {
                throw new NotImplementedException();
            }

            set
            {
                throw new NotImplementedException();
            }
        }

        public string Summary
        {
            get
            {
                throw new NotImplementedException();
            }

            set
            {
                throw new NotImplementedException();
            }
        }

        public string UID
        {
            get
            {
                throw new NotImplementedException();
            }

            set
            {
                throw new NotImplementedException();
            }
        }

        public OutlookToDo(Outlook.Application app) {
            app.CreateItem(Microsoft.Office.Interop.Outlook.OlItemType.olTaskItem);
		}
	}
}
