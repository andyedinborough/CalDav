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
            this.endLabel = new System.Windows.Forms.Label();
            this.startLabel = new System.Windows.Forms.Label();
            this.eventGroupBox = new System.Windows.Forms.GroupBox();
            this.connectionGroupBox = new System.Windows.Forms.GroupBox();
            this.fullUrlLabel = new System.Windows.Forms.Label();
            this.fullUrlTextBox = new System.Windows.Forms.TextBox();
            this.calidLabel = new System.Windows.Forms.Label();
            this.calidTextBox = new System.Windows.Forms.TextBox();
            this.pswdLabel = new System.Windows.Forms.Label();
            this.passwordTextBox = new System.Windows.Forms.TextBox();
            this.usernameLabel = new System.Windows.Forms.Label();
            this.usernameTextBox = new System.Windows.Forms.TextBox();
            this.label1 = new System.Windows.Forms.Label();
            this.urlCombo = new System.Windows.Forms.ComboBox();
            this.eventGroupBox.SuspendLayout();
            this.connectionGroupBox.SuspendLayout();
            this.SuspendLayout();
            // 
            // authButton
            // 
            this.authButton.Location = new System.Drawing.Point(64, 160);
            this.authButton.Name = "authButton";
            this.authButton.Size = new System.Drawing.Size(104, 23);
            this.authButton.TabIndex = 0;
            this.authButton.Text = "Athenticate";
            this.authButton.UseVisualStyleBackColor = true;
            this.authButton.Click += new System.EventHandler(this.testButton_Click);
            // 
            // createEventButton
            // 
            this.createEventButton.Location = new System.Drawing.Point(82, 188);
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
            this.eventEndPicker.Location = new System.Drawing.Point(82, 49);
            this.eventEndPicker.Name = "eventEndPicker";
            this.eventEndPicker.Size = new System.Drawing.Size(102, 20);
            this.eventEndPicker.TabIndex = 3;
            // 
            // eventSummaryTextBox
            // 
            this.eventSummaryTextBox.Location = new System.Drawing.Point(82, 78);
            this.eventSummaryTextBox.Name = "eventSummaryTextBox";
            this.eventSummaryTextBox.Size = new System.Drawing.Size(102, 20);
            this.eventSummaryTextBox.TabIndex = 4;
            // 
            // eventDescriptionTextBox
            // 
            this.eventDescriptionTextBox.Location = new System.Drawing.Point(82, 104);
            this.eventDescriptionTextBox.Multiline = true;
            this.eventDescriptionTextBox.Name = "eventDescriptionTextBox";
            this.eventDescriptionTextBox.Size = new System.Drawing.Size(102, 78);
            this.eventDescriptionTextBox.TabIndex = 5;
            // 
            // summaryLabel
            // 
            this.summaryLabel.AutoSize = true;
            this.summaryLabel.Location = new System.Drawing.Point(28, 81);
            this.summaryLabel.Name = "summaryLabel";
            this.summaryLabel.Size = new System.Drawing.Size(50, 13);
            this.summaryLabel.TabIndex = 6;
            this.summaryLabel.Text = "Summary";
            // 
            // descriptionLabel
            // 
            this.descriptionLabel.AutoSize = true;
            this.descriptionLabel.Location = new System.Drawing.Point(18, 107);
            this.descriptionLabel.Name = "descriptionLabel";
            this.descriptionLabel.Size = new System.Drawing.Size(60, 13);
            this.descriptionLabel.TabIndex = 7;
            this.descriptionLabel.Text = "Description";
            // 
            // endLabel
            // 
            this.endLabel.AutoSize = true;
            this.endLabel.Location = new System.Drawing.Point(18, 52);
            this.endLabel.Name = "endLabel";
            this.endLabel.Size = new System.Drawing.Size(60, 13);
            this.endLabel.TabIndex = 9;
            this.endLabel.Text = "Description";
            // 
            // startLabel
            // 
            this.startLabel.AutoSize = true;
            this.startLabel.Location = new System.Drawing.Point(26, 26);
            this.startLabel.Name = "startLabel";
            this.startLabel.Size = new System.Drawing.Size(50, 13);
            this.startLabel.TabIndex = 8;
            this.startLabel.Text = "Summary";
            // 
            // eventGroupBox
            // 
            this.eventGroupBox.Controls.Add(this.eventDescriptionTextBox);
            this.eventGroupBox.Controls.Add(this.endLabel);
            this.eventGroupBox.Controls.Add(this.createEventButton);
            this.eventGroupBox.Controls.Add(this.startLabel);
            this.eventGroupBox.Controls.Add(this.eventStartPicker);
            this.eventGroupBox.Controls.Add(this.descriptionLabel);
            this.eventGroupBox.Controls.Add(this.eventEndPicker);
            this.eventGroupBox.Controls.Add(this.summaryLabel);
            this.eventGroupBox.Controls.Add(this.eventSummaryTextBox);
            this.eventGroupBox.Location = new System.Drawing.Point(658, 12);
            this.eventGroupBox.Name = "eventGroupBox";
            this.eventGroupBox.Size = new System.Drawing.Size(200, 228);
            this.eventGroupBox.TabIndex = 10;
            this.eventGroupBox.TabStop = false;
            this.eventGroupBox.Text = "Event";
            // 
            // connectionGroupBox
            // 
            this.connectionGroupBox.Controls.Add(this.fullUrlLabel);
            this.connectionGroupBox.Controls.Add(this.fullUrlTextBox);
            this.connectionGroupBox.Controls.Add(this.calidLabel);
            this.connectionGroupBox.Controls.Add(this.calidTextBox);
            this.connectionGroupBox.Controls.Add(this.pswdLabel);
            this.connectionGroupBox.Controls.Add(this.passwordTextBox);
            this.connectionGroupBox.Controls.Add(this.authButton);
            this.connectionGroupBox.Controls.Add(this.usernameLabel);
            this.connectionGroupBox.Controls.Add(this.usernameTextBox);
            this.connectionGroupBox.Controls.Add(this.label1);
            this.connectionGroupBox.Controls.Add(this.urlCombo);
            this.connectionGroupBox.Location = new System.Drawing.Point(12, 12);
            this.connectionGroupBox.Name = "connectionGroupBox";
            this.connectionGroupBox.Size = new System.Drawing.Size(629, 228);
            this.connectionGroupBox.TabIndex = 11;
            this.connectionGroupBox.TabStop = false;
            this.connectionGroupBox.Text = "Connection";
            // 
            // fullUrlLabel
            // 
            this.fullUrlLabel.AutoSize = true;
            this.fullUrlLabel.Location = new System.Drawing.Point(22, 85);
            this.fullUrlLabel.Name = "fullUrlLabel";
            this.fullUrlLabel.Size = new System.Drawing.Size(39, 13);
            this.fullUrlLabel.TabIndex = 21;
            this.fullUrlLabel.Text = "Full Url";
            // 
            // fullUrlTextBox
            // 
            this.fullUrlTextBox.Location = new System.Drawing.Point(64, 82);
            this.fullUrlTextBox.Name = "fullUrlTextBox";
            this.fullUrlTextBox.ReadOnly = true;
            this.fullUrlTextBox.Size = new System.Drawing.Size(544, 20);
            this.fullUrlTextBox.TabIndex = 20;
            this.fullUrlTextBox.Text = "aliasgarikh@yahoo.com";
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
            // calidTextBox
            // 
            this.calidTextBox.Location = new System.Drawing.Point(64, 56);
            this.calidTextBox.Name = "calidTextBox";
            this.calidTextBox.Size = new System.Drawing.Size(544, 20);
            this.calidTextBox.TabIndex = 18;
            this.calidTextBox.Text = "testcalendar";
            this.calidTextBox.TextChanged += new System.EventHandler(this.urlCombo_TextChanged);
            // 
            // pswdLabel
            // 
            this.pswdLabel.AutoSize = true;
            this.pswdLabel.Location = new System.Drawing.Point(6, 137);
            this.pswdLabel.Name = "pswdLabel";
            this.pswdLabel.Size = new System.Drawing.Size(53, 13);
            this.pswdLabel.TabIndex = 17;
            this.pswdLabel.Text = "Password";
            // 
            // passwordTextBox
            // 
            this.passwordTextBox.Location = new System.Drawing.Point(64, 134);
            this.passwordTextBox.Name = "passwordTextBox";
            this.passwordTextBox.Size = new System.Drawing.Size(544, 20);
            this.passwordTextBox.TabIndex = 16;
            this.passwordTextBox.Text = "Sha\'erNazer1969";
            this.passwordTextBox.UseSystemPasswordChar = true;
            // 
            // usernameLabel
            // 
            this.usernameLabel.AutoSize = true;
            this.usernameLabel.Location = new System.Drawing.Point(6, 111);
            this.usernameLabel.Name = "usernameLabel";
            this.usernameLabel.Size = new System.Drawing.Size(55, 13);
            this.usernameLabel.TabIndex = 15;
            this.usernameLabel.Text = "Username";
            // 
            // usernameTextBox
            // 
            this.usernameTextBox.Location = new System.Drawing.Point(64, 108);
            this.usernameTextBox.Name = "usernameTextBox";
            this.usernameTextBox.Size = new System.Drawing.Size(544, 20);
            this.usernameTextBox.TabIndex = 14;
            this.usernameTextBox.Text = "aliasgarikh";
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
            "https://apidata.googleusercontent.com/caldav/v2/",
            "https://caldav.calendar.yahoo.com/dav/aliasgarikh/Calendar/"});
            this.urlCombo.Location = new System.Drawing.Point(64, 29);
            this.urlCombo.Name = "urlCombo";
            this.urlCombo.Size = new System.Drawing.Size(544, 21);
            this.urlCombo.TabIndex = 12;
            this.urlCombo.Text = "https://caldav.calendar.yahoo.com/dav/aliasgarikh/Calendar/";
            this.urlCombo.TextChanged += new System.EventHandler(this.urlCombo_TextChanged);
            // 
            // Main
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(877, 253);
            this.Controls.Add(this.connectionGroupBox);
            this.Controls.Add(this.eventGroupBox);
            this.Name = "Main";
            this.Text = "CalCli Demo";
            this.eventGroupBox.ResumeLayout(false);
            this.eventGroupBox.PerformLayout();
            this.connectionGroupBox.ResumeLayout(false);
            this.connectionGroupBox.PerformLayout();
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
        private System.Windows.Forms.Label endLabel;
        private System.Windows.Forms.Label startLabel;
        private System.Windows.Forms.GroupBox eventGroupBox;
        private System.Windows.Forms.GroupBox connectionGroupBox;
        private System.Windows.Forms.Label pswdLabel;
        private System.Windows.Forms.TextBox passwordTextBox;
        private System.Windows.Forms.Label usernameLabel;
        private System.Windows.Forms.TextBox usernameTextBox;
        private System.Windows.Forms.Label label1;
        private System.Windows.Forms.ComboBox urlCombo;
        private System.Windows.Forms.Label fullUrlLabel;
        private System.Windows.Forms.TextBox fullUrlTextBox;
        private System.Windows.Forms.Label calidLabel;
        private System.Windows.Forms.TextBox calidTextBox;
    }
}

