namespace CalCli.UI
{
    partial class OutlookOAuthForm
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
            this.authBrowser = new System.Windows.Forms.WebBrowser();
            this.SuspendLayout();
            // 
            // authBrowser
            // 
            this.authBrowser.Dock = System.Windows.Forms.DockStyle.Fill;
            this.authBrowser.Location = new System.Drawing.Point(0, 0);
            this.authBrowser.MinimumSize = new System.Drawing.Size(20, 20);
            this.authBrowser.Name = "authBrowser";
            this.authBrowser.Size = new System.Drawing.Size(976, 601);
            this.authBrowser.TabIndex = 0;
            this.authBrowser.Navigated += new System.Windows.Forms.WebBrowserNavigatedEventHandler(this.authBrowser_Navigated);
            this.authBrowser.Navigating += new System.Windows.Forms.WebBrowserNavigatingEventHandler(this.authBrowser_Navigating);
            // 
            // OutlookOAuthForm
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(976, 601);
            this.Controls.Add(this.authBrowser);
            this.Name = "OutlookOAuthForm";
            this.Text = "OutlookOAuthForm";
            this.Load += new System.EventHandler(this.OutlookOAuthForm_Load);
            this.ResumeLayout(false);

        }

        #endregion

        private System.Windows.Forms.WebBrowser authBrowser;
    }
}