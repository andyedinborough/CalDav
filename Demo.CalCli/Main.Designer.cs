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
            this.authWebBrowser = new System.Windows.Forms.WebBrowser();
            this.SuspendLayout();
            // 
            // authButton
            // 
            this.authButton.Location = new System.Drawing.Point(12, 12);
            this.authButton.Name = "authButton";
            this.authButton.Size = new System.Drawing.Size(104, 23);
            this.authButton.TabIndex = 0;
            this.authButton.Text = "Athenticate";
            this.authButton.UseVisualStyleBackColor = true;
            this.authButton.Click += new System.EventHandler(this.testButton_Click);
            // 
            // authWebBrowser
            // 
            this.authWebBrowser.Location = new System.Drawing.Point(122, 12);
            this.authWebBrowser.MinimumSize = new System.Drawing.Size(20, 20);
            this.authWebBrowser.Name = "authWebBrowser";
            this.authWebBrowser.Size = new System.Drawing.Size(846, 504);
            this.authWebBrowser.TabIndex = 1;
            this.authWebBrowser.Navigating += new System.Windows.Forms.WebBrowserNavigatingEventHandler(this.authWebBrowser_Navigating);
            // 
            // Main
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(980, 528);
            this.Controls.Add(this.authWebBrowser);
            this.Controls.Add(this.authButton);
            this.Name = "Main";
            this.Text = "CalCli Demo";
            this.ResumeLayout(false);

        }

        #endregion

        private System.Windows.Forms.Button authButton;
        private System.Windows.Forms.WebBrowser authWebBrowser;
    }
}

