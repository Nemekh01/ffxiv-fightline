import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, FormControl } from "@angular/forms"
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from "@angular/material";
import { first } from 'rxjs/operators';
import { IAuthenticationService } from "../../services/authentication.service-interface"
import { authenticationServiceToken } from "../../services/authentication.service-provider"

@Component({
    selector: "loginDialog",
    templateUrl: "./loginDialog.component.html",
    styleUrls: ["./loginDialog.component.css"]
})
export class LoginDialog implements OnInit {
    loginForm: FormGroup;
    loading = false;
    submitted = false;
    returnUrl: string;

    constructor(
        private snackBar: MatSnackBar,
        private formBuilder: FormBuilder,
        @Inject(authenticationServiceToken)private authenticationService: IAuthenticationService,
        public dialogRef: MatDialogRef<LoginDialog>,
        @Inject(MAT_DIALOG_DATA) public data: any) {

    }

    get f() { return this.loginForm.controls; }

    ngOnInit(): void {
        this.loginForm = this.formBuilder.group({
            username: ['', Validators.required],
            password: ['', Validators.required]
        });

        // reset login status
        this.authenticationService.logout();
    }

    onLoginClick() {
        this.submitted = true;

        // stop here if form is invalid
        if (this.loginForm.invalid) {

            Object.keys(this.loginForm.controls).forEach(it => {
                this.loginForm.controls[it].markAsTouched({ onlySelf: true });
            });
            return;
        }

        this.loading = true;
        this.authenticationService.login(this.f.username.value, this.f.password.value)
            .pipe(first())
            .subscribe(
                data => {
                    this.dialogRef.close(data);
                },
                error => {
                    this.snackBar.open("Invalid username or password", null,
                        {
                            duration:2000
                        });
                    this.loading = false;
                });
    }

    onSignUp() {
        this.dialogRef.close({signup: true});
        return false;
    }

    onNoClick() {
        this.dialogRef.close();
    }
}

