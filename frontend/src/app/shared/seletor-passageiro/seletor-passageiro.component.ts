import { Component, Input } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';

@Component({
  selector: 'app-seletor-passageiro',
  templateUrl: './seletor-passageiro.component.html',
  styleUrls: ['./seletor-passageiro.component.scss']
})
export class SeletorPassageiroComponent implements ControlValueAccessor {
  @Input() titulo: string = 'Titulo'
  @Input() subtitulo: string = 'Subtitulo'

  value: number = 0

  onChange = () => {}
  onTouch = () => {}

  writeValue(val: any): void {
    this.value = val
  }
  registerOnChange(fn: any): void {
    this.onChange = fn // A função fn é atribuída para onChange.
  }
  registerOnTouched(fn: any): void {
    this.onChange = fn // A função fn é atribuída para onTouch.
  }
  setDisabledState?(isDisabled: boolean): void {
    throw new Error('Method not implemented.');
  }
}
