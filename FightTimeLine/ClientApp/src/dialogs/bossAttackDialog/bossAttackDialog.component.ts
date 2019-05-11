import { Component, Input, Inject, OnInit, ViewChild, EventEmitter } from "@angular/core";
import { Observable , of} from "rxjs";
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, FormControl } from "@angular/forms"
import * as M from "../../core/Models";
import { Time } from "../../heplers/TimeValidator";
import { NzModalRef, NzTreeNodeOptions, NzTreeComponent, NzFormatEmitEvent, NzFormatBeforeDropEvent } from "ng-zorro-antd";

@Component({
  selector: "bossAttackDialog",
  templateUrl: "./bossAttackDialog.component.html",
  styleUrls: ["./bossAttackDialog.component.css"]
})

export class BossAttackDialog implements OnInit {

  @Input("data") data: M.IBossAbility;
  @ViewChild("tree") tree: NzTreeComponent;
  editForm: FormGroup;
  submitted = false;
  newAttack = true;
  settings: any;
  uniqueIndex: number = 0;
  expression: string;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: NzModalRef) {



  }

  convertToNodes(data: M.Combined): NzTreeNodeOptions {
    if (M.isSettingGroup(data)) {
      return <NzTreeNodeOptions>{
        title: data.operation.toString().toUpperCase(),
        key: (this.uniqueIndex++).toString(),
        children: data.operands.map(d => this.convertToNodes(d)),
        isLeaf: false,
        data: data,
        expanded: true
      };
    }
    if (M.isSetting(data)) {
      return <NzTreeNodeOptions>{
        title: data.description,
        key: (this.uniqueIndex++).toString(),
        isLeaf: true,
        data: data,
        expanded: true
      };
    }

    return null;
  }

  formatExpression(input: NzTreeNodeOptions): string {
    let result: string = "";
    if (input) {
      if (!input.isLeaf) {
        if (!input.children || input.children.length === 0)
          result = "";
        else {
          result = input.children.map(c => this.formatExpression(c)).filter(a => !!a).join(" " + input.title + " ");
          if (input.children.length > 1) {
            result = "(" + result + ")";
          }
        }
      } else {
        result = input.title;
      }
    }
    return result;
  }

  updateExpression() {
    this.expression = this.formatExpression(this.tree.getTreeNodes()[0]);
  }

  ngOnInit() {
    this.settings = [this.convertToNodes(<M.Combined>{
      operation: M.SyncOperation.And,
      operands: [
        {
          type: "name",
          description: "D1",
          payload: {}
        },
        {
          operation: M.SyncOperation.Or,
          operands: [
            {
              type: "name",
              description: "D3",
              payload: {}
            },
            {
              type: "name",
              description: "D4",
              payload: {}
            }
          ]
        },
        {
          type: "name",
          description: "D2",
          payload: {}
        },
        {
          operation: M.SyncOperation.Or,
          operands: [
            {
              type: "name",
              description: "D5",
              payload: {}
            },
            {
              operation: M.SyncOperation.And,
              operands: [
                {
                  type: "name",
                  description: "D6",
                  payload: {}
                },
                {
                  operation: M.SyncOperation.Or,
                  operands: [
                    {
                      type: "name",
                      description: "D8",
                      payload: {}
                    },
                    {
                      type: "name",
                      description: "D9",
                      payload: {}
                    }
                  ]
                },
                {
                  type: "name",
                  description: "D7",
                  payload: {}
                }
              ]
            }
          ]
        }]
    })];
    setTimeout(()=>this.updateExpression());
    this.newAttack = !this.data.name;
    this.dialogRef.getInstance().nzFooter = [
      {
        label: "Cancel",
        type: "primary",
        onClick: () => this.dialogRef.destroy()
      },
      {
        label: "Ok",
        onClick: () => this.onSaveClick()
      },
      {
        label: "Ok for All with same name",
        onClick: () => this.onSaveAllClick(),
        show: () => !this.newAttack
      }];

    this.editForm = this.formBuilder.group({
      bossAttackName: new FormControl(this.data.name, Validators.required),
      damageType: new FormControl(this.data.type, Validators.required),
      bossAttackTime: new FormControl(this.data.offset, Validators.required),
      tankBuster: new FormControl(this.data.isTankBuster),
      aoe: new FormControl(this.data.isAoe),
      share: new FormControl(this.data.isShareDamage),
    }, {
        validator: Time('bossAttackTime')
      });
  }

  get f() { return this.editForm.controls; }

  onNoClick(): void {
    this.dialogRef.close();
  }

  updateResult(): void {
    this.data.name = this.f.bossAttackName.value;
    this.f.bossAttackTime.updateValueAndValidity({ onlySelf: true });
    this.data.offset = this.f.bossAttackTime.value;
    this.data.type = this.f.damageType.value;
    this.data.isTankBuster = this.f.tankBuster.value;
    this.data.isAoe = this.f.aoe.value;
    this.data.isShareDamage = this.f.share.value;
  }

  onSaveClick(): void {
    this.submitted = true;

    if (this.editForm.invalid) {
      Object.keys(this.editForm.controls).forEach(it => {
        this.editForm.controls[it].markAsTouched({ onlySelf: true });
      });
      return;
    }
    this.updateResult();

    this.dialogRef.close({ updateAllWithSameName: false, data: this.data });
  };

  onSaveAllClick(): void {
    this.submitted = true;

    if (this.editForm.invalid) {
      Object.keys(this.editForm.controls).forEach(it => {
        this.editForm.controls[it].markAsTouched({ onlySelf: true });
      });
      return;
    }

    this.updateResult();

    this.dialogRef.close({ updateAllWithSameName: true, data: this.data });
  };

  addAnd() {
    const selected = this.selected;
    if (selected) {
      const index = this.uniqueIndex++;
      selected.addChildren([<NzTreeNodeOptions>{
        title: "AND",
        key: (index).toString(),
        isLeaf: false,
        data: {},
        expanded: true
      }]);
      this.updateExpression();
    }
  }

  get selected(): NzTreeNodeOptions {
    const s = this.tree.getSelectedNodeList();
    if (s)
      return s[0];
    else
      return null;
  }

  addOr() {
    const selected = this.selected;
    if (selected) {
      const index = this.uniqueIndex++;
      selected.addChildren([<NzTreeNodeOptions>{
        title: "OR",
        key: (index).toString(),
        isLeaf: false,
        data: {},
        expanded: true
      }]);
      this.updateExpression();
    }
  }

  addCondition() {
    const selected = this.selected;
    if (selected) {
      const index = this.uniqueIndex++;
      selected.addChildren([<NzTreeNodeOptions>{
        title: "Condition " + index,
        key: (index).toString(),
        isLeaf: true,
        data: {},
        expanded: true
      }]);
      this.updateExpression();
    }
  }

  remove() {
    const selected =  this.selected;
    if (selected && selected.getParentNode()) {
      selected.remove();
      this.updateExpression();
    }
  }

  nzDrop(event: NzFormatEmitEvent) {
    this.updateExpression();
  }

  beforeDrop(arg: NzFormatBeforeDropEvent): Observable<boolean> {
    // if insert node into another node, wait 1s

    if (!arg.node.getParentNode() && (arg.pos === -1 || arg.pos === 1))
      return of(false);
    return of(true);
  }

  typeChange() {
    const selected = this.selected;
    if (selected) {
      selected.title = selected.origin.data.operation.toString().toUpperCase();
      selected.origin.title = selected.origin.data.operation.toString().toUpperCase();
      this.expression = this.formatExpression(this.settings[0]);
    }
  }
}

