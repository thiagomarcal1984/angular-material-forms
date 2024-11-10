import { UnidadeFederativa } from 'src/app/core/types/type';
import { UnidadeFederativaService } from './../../../core/services/unidade-federativa.service';
import { Component, Input, OnInit } from '@angular/core';
import { map, Observable, startWith } from 'rxjs';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-dropdown-uf',
  templateUrl: './dropdown-uf.component.html',
  styleUrls: ['./dropdown-uf.component.scss']
})

// Acréscimo da implementação da interface OnInit.
export class DropdownUfComponent implements OnInit {
  @Input() label: string = ''
  @Input() iconePrefixo: string = ''
  @Input() control!: FormControl

  // Propriedade que vai receber as unidades
  // federativas após a inicialização com ngOnInit.
  unidadesFederativas: UnidadeFederativa[] = []

  // Observables com as unidades federativas filtradas.
  opcoesFiltradas$?: Observable<UnidadeFederativa[]>

  constructor (
    // Injeção do serviço UnidadeFederativaService
    private unidadeFederativaService: UnidadeFederativaService,
  ) {}

  ngOnInit(): void { // Método obrigatório da interface OnInit.
    this.unidadeFederativaService.listar()
      .subscribe(dados => {
        // Atribuição da unidades federativas.
        this.unidadesFederativas = dados
        // Impressão das unidades federativas para teste.
        console.log(this.unidadesFederativas)
      })

      // Para qualquer mudança de valor no controle, retorna
      // um mapeamento oriundo da função filtrarUfs.
      this.opcoesFiltradas$ = this.control.valueChanges.pipe(
        startWith(''),
        map(value => this.filtrarUfs(value || '')),
      );
    }

  private filtrarUfs(value: string): UnidadeFederativa[] {
    const valorFiltrado = value.toLowerCase();

    return this.unidadesFederativas.filter(estado => estado.nome.toLowerCase().includes(valorFiltrado));
  }
}
