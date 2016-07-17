namespace Demo.CalCli
{
    partial class Main
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.authButton = new System.Windows.Forms.Button();
            this.createEventButton = new System.Windows.Forms.Button();
            this.eventStartPicker = new System.Windows.Forms.DateTimePicker();
            this.eventEndPicker = new System.Windows.Forms.DateTimePicker();
            this.eventSummaryTextBox = new System.Windows.Forms.TextBox();
            this.eventDescriptionTextBox = new System.Windows.Forms.TextBox();
            this.summaryLabel = new System.Windows.Forms.Label();
            this.descriptionLabel = new System.Windows.Forms.Label();
            this.startLabel = new System.Windows.Forms.Label();
            this.eventGroupBox = new System.Windows.Forms.GroupBox();
            this.button1 = new System.Windows.Forms.Button();
            this.connectionGroupBox = new System.Windows.Forms.GroupBox();
            this.comboBox1 = new System.Windows.Forms.ComboBox();
            this.calidLabel = new System.Windows.Forms.Label();
            this.pswdLabel = new System.Windows.Forms.Label();
            this.passwordTextBox = new System.Windows.Forms.TextBox();
            this.usernameLabel = new System.Windows.Forms.Label();
            this.usernameTextBox = new System.Windows.Forms.TextBox();
            this.label1 = new System.Windows.Forms.Label();
            this.urlCombo = new System.Windows.Forms.ComboBox();
            this.checkList = new System.Windows.Forms.CheckedListBox();
            this.groupBox1 = new System.Windows.Forms.GroupBox();
            this.button2 = new System.Windows.Forms.Button();
            this.eventGroupBox.SuspendLayout();
            this.connectionGroupBox.SuspendLayout();
            this.groupBox1.SuspendLayout();
            this.SuspendLayout();
            // 
            // authButton
            // 
            this.authButton.Location = new System.Drawing.Point(64, 134);
            this.authButton.Name = "authButton";
            this.authButton.Size = new System.Drawing.Size(104, 23);
            this.authButton.TabIndex = 0;
            this.authButton.Text = "Connect";
            this.authButton.UseVisualStyleBackColor = true;
            this.authButton.Click += new System.EventHandler(this.testButton_Click);
            // 
            // createEventButton
            // 
            this.createEventButton.Location = new System.Drawing.Point(82, 134);
            this.createEventButton.Name = "createEventButton";
            this.createEventButton.Size = new System.Drawing.Size(102, 23);
            this.createEventButton.TabIndex = 1;
            this.createEventButton.Text = "Create Event";
            this.createEventButton.UseVisualStyleBackColor = true;
            this.createEventButton.Click += new System.EventHandler(this.createEventButton_Click);
            // 
            // eventStartPicker
            // 
            this.eventStartPicker.Format = System.Windows.Forms.DateTimePickerFormat.Time;
            this.eventStartPicker.Location = new System.Drawing.Point(82, 23);
            this.eventStartPicker.Name = "eventStartPicker";
            this.eventStartPicker.Size = new System.Drawing.Size(102, 20);
            this.eventStartPicker.TabIndex = 2;
            // 
            // eventEndPicker
            // 
            this.eventEndPicker.Format = System.Windows.Forms.DateTimePickerFormat.Time;
            this.eventEndPicker.Location = new System.Drawing.Point(190, 23);
            this.eventEndPicker.Name = "eventEndPicker";
            this.eventEndPicker.Size = new System.Drawing.Size(102, 20);
            this.eventEndPicker.TabIndex = 3;
            // 
            // eventSummaryTextBox
            // 
            this.eventSummaryTextBox.Location = new System.Drawing.Point(82, 52);
            this.eventSummaryTextBox.Name = "eventSummaryTextBox";
            this.eventSummaryTextBox.Size = new System.Drawing.Size(210, 20);
            this.eventSummaryTextBox.TabIndex = 4;
            // 
            // eventDescriptionTextBox
            // 
            this.eventDescriptionTextBox.Location = new System.Drawing.Point(82, 78);
            this.eventDescriptionTextBox.Multiline = true;
            this.eventDescriptionTextBox.Name = "eventDescriptionTextBox";
            this.eventDescriptionTextBox.Size = new System.Drawing.Size(210, 50);
            this.eventDescriptionTextBox.TabIndex = 5;
            // 
            // summaryLabel
            // 
            this.summaryLabel.AutoSize = true;
            this.summaryLabel.Location = new System.Drawing.Point(28, 55);
            this.summaryLabel.Name = "summaryLabel";
            this.summaryLabel.Size = new System.Drawing.Size(50, 13);
            this.summaryLabel.TabIndex = 6;
            this.summaryLabel.Text = "Summary";
            // 
            // descriptionLabel
            // 
            this.descriptionLabel.AutoSize = true;
            this.descriptionLabel.Location = new System.Drawing.Point(18, 81);
            this.descriptionLabel.Name = "descriptionLabel";
            this.descriptionLabel.Size = new System.Drawing.Size(60, 13);
            this.descriptionLabel.TabIndex = 7;
            this.descriptionLabel.Text = "Description";
            // 
            // startLabel
            // 
            this.startLabel.AutoSize = true;
            this.startLabel.Location = new System.Drawing.Point(44, 27);
            this.startLabel.Name = "startLabel";
            this.startLabel.Size = new System.Drawing.Size(30, 13);
            this.startLabel.TabIndex = 8;
            this.startLabel.Text = "Time";
            // 
            // eventGroupBox
            // 
            this.eventGroupBox.Controls.Add(this.button1);
            this.eventGroupBox.Controls.Add(this.eventDescriptionTextBox);
            this.eventGroupBox.Controls.Add(this.createEventButton);
            this.eventGroupBox.Controls.Add(this.startLabel);
            this.eventGroupBox.Controls.Add(this.eventStartPicker);
            this.eventGroupBox.Controls.Add(this.descriptionLabel);
            this.eventGroupBox.Controls.Add(this.eventEndPicker);
            this.eventGroupBox.Controls.Add(this.summaryLabel);
            this.eventGroupBox.Controls.Add(this.eventSummaryTextBox);
            this.eventGroupBox.Location = new System.Drawing.Point(270, 185);
            this.eventGroupBox.Name = "eventGroupBox";
            this.eventGroupBox.Size = new System.Drawing.Size(301, 167);
            this.eventGroupBox.TabIndex = 10;
            this.eventGroupBox.TabStop = false;
            this.eventGroupBox.Text = "Event";
            // 
            // button1
            // 
            this.button1.Location = new System.Drawing.Point(190, 134);
            this.button1.Name = "button1";
            this.button1.Size = new System.Drawing.Size(102, 23);
            this.button1.TabIndex = 9;
            this.button1.Text = "Create ToDo";
            this.button1.UseVisualStyleBackColor = true;
            this.button1.Click += new System.EventHandler(this.button1_Click_1);
            // 
            // connectionGroupBox
            // 
            this.connectionGroupBox.Controls.Add(this.comboBox1);
            this.connectionGroupBox.Controls.Add(this.calidLabel);
            this.connectionGroupBox.Controls.Add(this.pswdLabel);
            this.connectionGroupBox.Controls.Add(this.passwordTextBox);
            this.connectionGroupBox.Controls.Add(this.authButton);
            this.connectionGroupBox.Controls.Add(this.usernameLabel);
            this.connectionGroupBox.Controls.Add(this.usernameTextBox);
            this.connectionGroupBox.Controls.Add(this.label1);
            this.connectionGroupBox.Controls.Add(this.urlCombo);
            this.connectionGroupBox.Location = new System.Drawing.Point(12, 12);
            this.connectionGroupBox.Name = "connectionGroupBox";
            this.connectionGroupBox.Size = new System.Drawing.Size(559, 167);
            this.connectionGroupBox.TabIndex = 11;
            this.connectionGroupBox.TabStop = false;
            this.connectionGroupBox.Text = "Connection";
            // 
            // comboBox1
            // 
            this.comboBox1.FormattingEnabled = true;
            this.comboBox1.Location = new System.Drawing.Point(64, 55);
            this.comboBox1.Name = "comboBox1";
            this.comboBox1.Size = new System.Drawing.Size(486, 21);
            this.comboBox1.TabIndex = 22;
            // 
            // calidLabel
            // 
            this.calidLabel.AutoSize = true;
            this.calidLabel.Location = new System.Drawing.Point(27, 59);
            this.calidLabel.Name = "calidLabel";
            this.calidLabel.Size = new System.Drawing.Size(31, 13);
            this.calidLabel.TabIndex = 19;
            this.calidLabel.Text = "CalId";
            // 
            // pswdLabel
            // 
            this.pswdLabel.AutoSize = true;
            this.pswdLabel.Location = new System.Drawing.Point(6, 111);
            this.pswdLabel.Name = "pswdLabel";
            this.pswdLabel.Size = new System.Drawing.Size(53, 13);
            this.pswdLabel.TabIndex = 17;
            this.pswdLabel.Text = "Password";
            // 
            // passwordTextBox
            // 
            this.passwordTextBox.Location = new System.Drawing.Point(64, 108);
            this.passwordTextBox.Name = "passwordTextBox";
            this.passwordTextBox.Size = new System.Drawing.Size(486, 20);
            this.passwordTextBox.TabIndex = 16;
            this.passwordTextBox.Text = "Aliasgarikh20";
            this.passwordTextBox.UseSystemPasswordChar = true;
            // 
            // usernameLabel
            // 
            this.usernameLabel.AutoSize = true;
            this.usernameLabel.Location = new System.Drawing.Point(6, 85);
            this.usernameLabel.Name = "usernameLabel";
            this.usernameLabel.Size = new System.Drawing.Size(55, 13);
            this.usernameLabel.TabIndex = 15;
            this.usernameLabel.Text = "Username";
            // 
            // usernameTextBox
            // 
            this.usernameTextBox.Location = new System.Drawing.Point(64, 82);
            this.usernameTextBox.Name = "usernameTextBox";
            this.usernameTextBox.Size = new System.Drawing.Size(486, 20);
            this.usernameTextBox.TabIndex = 14;
            this.usernameTextBox.Text = "aliasgarikh@icloud.com";
            this.usernameTextBox.TextChanged += new System.EventHandler(this.usernameTextBox_TextChanged);
            // 
            // label1
            // 
            this.label1.AutoSize = true;
            this.label1.Location = new System.Drawing.Point(38, 33);
            this.label1.Name = "label1";
            this.label1.Size = new System.Drawing.Size(20, 13);
            this.label1.TabIndex = 13;
            this.label1.Text = "Url";
            // 
            // urlCombo
            // 
            this.urlCombo.FormattingEnabled = true;
            this.urlCombo.Items.AddRange(new object[] {
            "https://caldav.icloud.com/",
            "https://apidata.googleusercontent.com/caldav/v2/",
            "https://caldav.calendar.yahoo.com/dav/",
            "Outlook"});
            this.urlCombo.Location = new System.Drawing.Point(64, 29);
            this.urlCombo.Name = "urlCombo";
            this.urlCombo.Size = new System.Drawing.Size(486, 21);
            this.urlCombo.TabIndex = 12;
            this.urlCombo.Text = "https://caldav.icloud.com/";
            // 
            // checkList
            // 
            this.checkList.FormattingEnabled = true;
            this.checkList.Location = new System.Drawing.Point(9, 34);
            this.checkList.Name = "checkList";
            this.checkList.Size = new System.Drawing.Size(237, 94);
            this.checkList.TabIndex = 12;
            // 
            // groupBox1
            // 
            this.groupBox1.Controls.Add(this.button2);
            this.groupBox1.Controls.Add(this.checkList);
            this.groupBox1.Location = new System.Drawing.Point(12, 185);
            this.groupBox1.Name = "groupBox1";
            this.groupBox1.Size = new System.Drawing.Size(252, 167);
            this.groupBox1.TabIndex = 13;
            this.groupBox1.TabStop = false;
            this.groupBox1.Text = "ToDos";
            // 
            // button2
            // 
            this.button2.Location = new System.Drawing.Point(9, 134);
            this.button2.Name = "button2";
            this.button2.Size = new System.Drawing.Size(102, 23);
            this.button2.TabIndex = 10;
            this.button2.Text = "Update";
            this.button2.UseVisualStyleBackColor = true;
            this.button2.Click += new System.EventHandler(this.button2_Click);
            // 
            // Main
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(580, 362);
            this.Controls.Add(this.groupBox1);
            this.Controls.Add(this.connectionGroupBox);
            this.Controls.Add(this.eventGroupBox);
            this.Name = "Main";
            this.Text = "CalCli Demo";
            this.Load += new System.EventHandler(this.Main_Load);
            this.eventGroupBox.ResumeLayout(false);
            this.eventGroupBox.PerformLayout();
            this.connectionGroupBox.ResumeLayout(false);
            this.connectionGroupBox.PerformLayout();
            this.groupBox1.ResumeLayout(false);
            this.ResumeLayout(false);

        }

        #endregion

        private System.Windows.Forms.Button authButton;
        private System.Windows.Forms.Button createEventButton;
        private System.Windows.Forms.DateTimePicker eventStartPicker;
        private System.Windows.Forms.DateTimePicker eventEndPicker;
        private System.Windows.Forms.TextBox eventSummaryTextBox;
        private System.Windows.Forms.TextBox eventDescriptionTextBox;
        private System.Windows.Forms.Label summaryLabel;
        private System.Windows.Forms.Label descriptionLabel;
        private System.Windows.Forms.Label startLabel;
        private System.Windows.Forms.GroupBox eventGroupBox;
        private System.Windows.Forms.GroupBox connectionGroupBox;
        private System.Windows.Forms.Label pswdLabel;
        private System.Windows.Forms.TextBox passwordTextBox;
        private System.Windows.Forms.Label usernameLabel;
        private System.Windows.Forms.TextBox usernameTextBox;
        private System.Windows.Forms.Label label1;
        private System.Windows.Forms.ComboBox urlCombo;
        private System.Windows.Forms.Label calidLabel;
        private System.Windows.Forms.ComboBox comboBox1;
        private System.Windows.Forms.Button button1;
        private System.Windows.Forms.CheckedListBox checkList;
        private System.Windows.Forms.GroupBox groupBox1;
        private System.Windows.Forms.Button button2;
    }
}

