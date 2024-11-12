# Serviços e Injeção de Dependência
## Preparando o ambiente

Instalação do Angular na versão do curso:
```bash
 npm install -g @angular/cli@16.0.0
 ```
 
[Repositório com a API de Backend](https://github.com/alura-cursos/jornada-milhas-api.git)

Depois de baixar a API de Backend, acesse o diretório e instale as suas dependências com o comando abaixo:
 ```bash
npm i
 ```

Em seguida, execute a API:
 ```bash
 npm run start:dev	
 ```

 [Frontend do Curso Anterior](https://github.com/alura-cursos/jornada/archive/1a1a3c686d3f2b708b5964b91fc455a418fffd67.zip)
 
 Depois de baixar o código do Frontend, acesse o diretório e instale as suas dependências:
 ```bash
npm i
 ```

Depois sirva o frontend:
 ```bash
 ng serve
 ```

## Entendendo o providedIn
Crie um TypeScript com os tipos que serão usados a partir da API.
```TypeScript
export interface Promocao {
  id: number
  destino: string
  imagem: string
  preco: number
}
```

Em seguida, crie o serviço `core/services/promocao`:
```bash
cd frontend
ng g s core/services/promocao
# Output:
CREATE src/app/core/services/promocao.service.spec.ts (367 bytes)
CREATE src/app/core/services/promocao.service.ts (137 bytes)
```

Vamos estudar o Type Script do serviço gerado
```TypeScript
// frontend\src\app\core\services\promocao.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root' // Indica onde o serviço será provido.
})
export class PromocaoService {

  constructor() { }
}
```

O parâmetro `providedIn` dentro da declaração `@Injectable` indica onde que o serviço será provido. No caso, ele será provido no componente `root` da aplicação.

O uso do `provideIn` no componente `app-root` é um meio de implementar o design pattern Singleton.

## Manipulando variáveis de ambiente
O Angular permite a criação de environments (ambientes) a partir da CLI:
```bash
# O comando abaixo não pode ser resumido (como 'ng g e')
ng generate environments
# Output
CREATE src/environments/environment.ts (31 bytes)
CREATE src/environments/environment.development.ts (31 bytes)
UPDATE angular.json (3322 bytes)
```

O arquivo `angular.json` foi atualizado com as referências aos arquivos `environment.ts` e `environment.development.ts`. Cada um dos arquivos criados tem a função de armazenar os conteúdos das variáveis de ambiente:
```TypeScript
// frontend\src\environments\environment.development.ts
export const environment = {
  apiUrl : 'http://localhost:8080'
};
```

Mudança no aruqivo `angular.json`:
```TypeScript
{

    "projects": {
      "jornada-milhas": {
        // Resto do código
        "architect": {
          "build": {
            //  Resto do Código
            "configurations": {
              "fileReplacements": [
                  {
                    "replace": "src/environments/environment.ts",
                    "with": "src/environments/environment.development.ts"
                  }
                ]
            }
            // Resto do código
          }
        }
      }
    }
}
```
> Graças ao código acima, o Angular vai definir o ambiente de desenvolvimento como padrão ao rodar o `ng serve`.

Implementação do serviço `PromocaoService`:
```TypeScript
// frontend\src\app\core\services\promocao.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Promocao } from '../types/type';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PromocaoService {

  constructor(
    // Definição do atributo privado httpClient.
    private httpClient: HttpClient 
  ) { }

  // Caregamento da variável de ambiente apiUrl
  private apiUrl: string = environment.apiUrl

  listar() : Observable<Promocao[]> { 
    // O Observable retornado conterá um array de Promocao.
    return this.httpClient.get<Promocao[]>(`${this.apiUrl}/promocoes`)
  }
}
```

Vamos testar o funcionamento do serviço `PromocaoService` no componente `home.component.ts`:
```TypeScript
// frontend\src\app\pages\home\home.component.ts
import { Component, OnInit } from '@angular/core';
import { PromocaoService } from 'src/app/core/services/promocao.service';

@Component({
    // Resto do código
})
export class HomeComponent implements OnInit {
  constructor( private servicoPromocao: PromocaoService) {}
  ngOnInit(): void {
      this.servicoPromocao.listar()
  }
}
```

O serviço não conseguirá ser injetado em `HomeComponent`, apesar das declarações corretas do `HttpClient` do Angular. Isso acontece porque ainda é necessário importar o módulo `HttpClientModule` no módulo raiz da aplicação:

```TypeScript
import { NgModule } from '@angular/core';
// Resto do código
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  // Resto do código
  imports: [
      // Resto do código
    HttpClientModule
  ],
  // Resto do código
})

export class AppModule { }
```

Mesmo após corrigir o import do módulo `HttpClientModule`, o construtor de `HomeComponent` não executa o método `listar`. Isso será avaliado na próxima aula.

## De olho no observable
Os objetos `Observable` possuem o método `subscribe`. Esse método liga o `Observable` ao observador que o requisitou e implementa o callback que será chamado quando o `Observable` mudar. No exemplo abaixo, o componente `HomeComponent` referencia o serviço `PromocaoService`. Este último será o observador que vai se subscrever aos `Observable<Promocao[]>` retornados, e vai reagir com o callback do `console.log`:

```TypeScript
import { Component, OnInit } from '@angular/core';
import { PromocaoService } from 'src/app/core/services/promocao.service';

@Component({
  // Resto do código
})
export class HomeComponent implements OnInit {
  constructor( private servicoPromocao: PromocaoService) {}
  ngOnInit(): void { // Comportamento ao iniciar o componente.
      this.servicoPromocao.listar() // O serviço chamada o método, mas não se inscreveu ainda.
        .subscribe( // Os Observable retornados permitem a subscrição pelo serviço `servicoPromocao`.
          resposta => { // Declaração do callback.
            console.log(resposta) // Execução do callback quando o Observable mudar.
          }
        )
  }
}
```
## Desafio: ajustes de layout e novos serviços
Mudanças em `HomeComponent`:

```HTML
<!-- frontend\src\app\pages\home\home.component.html -->
<!-- Resto do código -->
    <app-card-busca *ngFor="let item of promocoes" [promocao]="item"></app-card-busca>
<!-- Resto do código -->
```
``` TypeScript
// frontend\src\app\pages\home\home.component.ts
// Resto do código
import { Promocao } from 'src/app/core/types/type';

@Component({
  // Resto do código
})
export class HomeComponent implements OnInit {
  promocoes!: Promocao[] // Variável visualizada no HTML.
  // Note a exclamação depois da declaração: isso permite variáveis não inicializadas.
  // Resto do código
  ngOnInit(): void {
      this.servicoPromocao.listar()
        .subscribe(
          resposta => {
            this.promocoes = resposta
          }
        )
  }
}
```

Mudanças em `CardBuscaComponent`:
```HTML
<!-- frontend\src\app\shared\card-busca\card-busca.component.html -->
<mat-card class="card-busca">
  <img mat-card-image
    src="{{ promocao.imagem }}" alt="Imagem do destino">
  <mat-card-content>
    <ul>
      <li>{{ promocao.destino }}</li>
      <li>R$ {{ promocao.preco }}</li>
    </ul>
  </mat-card-content>
  <!-- Resto do código -->
</mat-card>
```
> Basicamente é mudança na interpolação.

```TypeScript
import { Component, Input } from '@angular/core';
import { Promocao } from 'src/app/core/types/type';

@Component({
  selector: 'app-card-busca',
  templateUrl: './card-busca.component.html',
  styleUrls: ['./card-busca.component.scss']
})
export class CardBuscaComponent {
  @Input() promocao!: Promocao
}
```
> Note que a variável de Input `promocao` só é preenchida por um componente externo, no caso a partir de `HomeComponent`.

# Formulário controlado
## Analisando o form de busca
Vamos criar o serviço do form-busca:

```bash
PS D:\alura\angular-material-forms\frontend> ng g s core/services/form-busca
CREATE src/app/core/services/form-busca.service.spec.ts (373 bytes)
CREATE src/app/core/services/form-busca.service.ts (138 bytes)
```

O serviço vai simplesmente instanciar um objeto `FormGroup` do Angular. A ideia é permitir reúso do formulário desse serviço em diferentes componentes.

```TypeScript
// frontend\src\app\core\services\form-busca.service.ts
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class FormBuscaService {
  formBusca: FormGroup
  constructor() {
    this.formBusca = new FormGroup({})
  }
}
```
## Um serviço para a todos governar
Inclusão do controle de formulário `somenteIda` no serviço `FormBuscaService`:
```TypeScript
// frontend\src\app\core\services\form-busca.service.ts
import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class FormBuscaService {
  formBusca: FormGroup
  constructor() {
    this.formBusca = new FormGroup({
      // O parâmetro booleano em FormControl é pra saber
      // se o o fluxo (databinding) é de somente ida.
      somenteIda: new FormControl(false)
    })
  }
}
```

Inclusão do serviço `FormBuscaService` no componente `FormBuscaComponent`:
```TypeScript
// frontend\src\app\shared\form-busca\form-busca.component.ts
// Resto do código
import { FormBuscaService } from 'src/app/core/services/form-busca.service';

@Component({
  // Resto do código
})
export class FormBuscaComponent {
  constructor(
    public dialog: MatDialog,
    private formBuscaService:FormBuscaService
  ) {}

  // Resto do código
}
```

## TypeScript a nosso favor
Primeira mudança no HTML do componente `FormBuscaComponent`:
```HTML
<!-- frontend\src\app\shared\form-busca\form-busca.component.html -->
<app-card variant="secondary" class="form-busca">
  <form [formGroup]="formBuscaService.formBusca">
  <!-- Resto do código -->
   </form>
</app-card>
```
A mudança de agora foi associar o FormGroup `formBusca` do serviço ao formulário do componente. Mas o seguinte erro aparece: 
```
src/app/shared/form-busca/form-busca.component.html:2:10 - error NG8002: Can't bind to 'formGroup' since it isn't a known property of 'form'.

2    <form [formGroup]="formBuscaService.formBusca">
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  src/app/shared/form-busca/form-busca.component.ts:8:16
    8   templateUrl: './form-busca.component.html',
                     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Error occurs in the template of component FormBuscaComponent.
```

Isso acontece porque o módulo do FormGroup não foi importado em `app.module.ts`:
```TypeScript
// frontend\src\app\app.module.ts
import { NgModule } from '@angular/core';
// Resto do código
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [ // para componentes externos.
    // Resto do código
  ],
  imports: [ // para módulos externos.
    // Resto do código
    ReactiveFormsModule,
  ],
  // Resto do código
})
export class AppModule { }
```
> Note que o que foi importado foi o `ReactiveFormsModule`, não o `FormsModule`.

Mesmo após importar o `ReactiveFormsModule`, outro erro aparece: 
```
src/app/shared/form-busca/form-busca.component.html:2:23 - error TS2341: Property 'formBuscaService' is private and only accessible within class 'FormBuscaComponent'.

2    <form [formGroup]="formBuscaService.formBusca">
                        ~~~~~~~~~~~~~~~~

  src/app/shared/form-busca/form-busca.component.ts:8:16
    8   templateUrl: './form-busca.component.html',
                     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Error occurs in the template of component FormBuscaComponent.
```

Autoexplicativo: o serviço está privado no componente. Vamos torná-lo público: 
```TypeScript
// frontend\src\app\core\services\form-busca.service.ts
import { Component } from '@angular/core';
// Resto do código
import { FormBuscaService } from 'src/app/core/services/form-busca.service';

@Component({
  // Resto do código
})
export class FormBuscaComponent {
  constructor(
    // Resto do código
    public formBuscaService: FormBuscaService
  ) {}
  // Resto do código
}
```

Agora vamos modificar o MatButtonToggle no componente `FormBuscaComponent`:
```HTML
<!-- frontend\src\app\shared\form-busca\form-busca.component.html -->
<app-card variant="secondary" class="form-busca">
   <form [formGroup]="formBuscaService.formBusca">
    <h2>Passagens</h2>
    <div class="flex-container">
      <mat-button-toggle-group aria-label="Tipo de passagem" formControlName="somenteIda">
        <mat-button-toggle [value]="false">
          <mat-icon *ngIf="!formBuscaService.formBusca.get('somenteIda')?.value">check</mat-icon>
          IDA E VOLTA
        </mat-button-toggle>
        <mat-button-toggle [value]="true">
          <mat-icon *ngIf="formBuscaService.formBusca.get('somenteIda')?.value">check</mat-icon>
          SOMENTE IDA
        </mat-button-toggle>
      </mat-button-toggle-group>
      <!-- Resto do código -->
    </div>
    <!-- Resto do código -->
  </form>
</app-card>
```

> Pontos para observar:
> 1. O elemento `<mat-button-toggle>` tinha o atributo `checked`. Agora ele foi removido.
> 2. O controle do estado agora vai acontecer em função do `value` selecionado para o `<mat-button-toggle-group>`.
> 3. Repare na interrogação depois do método `.get` em cada `<mat-button-toggle>`. Ele é chamado de `nullable operator` e serve para criar um "curto circuito", em que se força o retorno `null` caso a função não tenha retorno, e assim não há a tentativa de acesso ao atributo `value`.
> 4. A função `if` dentro de cada `<mat-icon>` testa se o ícone será ou não exibido, a depender do valor selecionado do `<mat-button-toggle-group>`.

## Desafio: Serviço de Unidades Federativas
Gerando o serviço `UnidadeFederativaService`:
```bash
ng g s core/services/UnidadeFederativa  
# Output
CREATE src/app/core/services/unidade-federativa.service.spec.ts (413 bytes)
CREATE src/app/core/services/unidade-federativa.service.ts (146 bytes)
```
> Note que não escrevemos o sufixo `Service` para gerar o serviço. Isso é feito automaticamente pelo Angular CLI.

Depois, vamos criar a interface `UnidadeFederativa` no arquivo `types.ts`:
```TypeScript
// frontend\src\app\core\types\type.ts

// export interface Promocao { Resto do código }

export interface UnidadeFederativa {
  id: number
  nome: string
  sigla: string
}
```

Finalmente, vamos implementar o serviço de `UnidadeFederativaService`:
```TypeScript
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { UnidadeFederativa } from '../types/type';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UnidadeFederativaService {
  private apiUrl: string = environment.apiUrl
  // Toda variável sufixada com $ (dolar sign) representa
  // um Observable ou uma stream.
  private cache$?: Observable<UnidadeFederativa[]>

  constructor(
    private http: HttpClient
  ) { }

  listar(): Observable<UnidadeFederativa[]> {
    if (!this.cache$) {
      // Depois de concluir requestEstados(), o
      // resultado é enviado para o método
      // shareReplay, que gera o cache e
      // evita uma nova requisição HTTP.
      this.cache$ = this.requestEstados().pipe(
        shareReplay(1)
      )
    }

    return this.cache$
  }

  // Este método só é chamado na primeira
  // criação do cache$.
  private requestEstados(): Observable<UnidadeFederativa[]> {
    return this.http.get<UnidadeFederativa[]>(`${this.apiUrl}/estados`)
  }
}
```

# Dropdown de origem e destino
## Preparando a base
Criando o subcomponente `DropdownUfComponent` dentro de `FormBusca`:
```bash
ng g c shared/form-busca/dropdown-uf
```

Criado o componente `DropdownUfComponent`, vamos copiar o HTML dele a partir do HTML do `FormBuscaComponent`:
```HTML
<!-- frontend\src\app\shared\form-busca\dropdown-uf\dropdown-uf.component.html -->
<mat-form-field class="input-container" appearance="outline">
  <mat-label>Label</mat-label>
  <mat-icon matPrefix>
    question_mark
  </mat-icon>
  <input matInput placeholder="Placeholder">
  <mat-icon matSuffix>search</mat-icon>
</mat-form-field>
```
> Depois vamos interpolar os textos `Label`, `question_mark` e `Placeholder` nas próximas aulas.

Vamos testar o uso do dropdown no HTML do `FormBuscaComponent`:
```HTML
<app-card variant="secondary" class="form-busca">
   <form [formGroup]="formBuscaService.formBusca">
    <h2>Passagens</h2>
    <!-- Resto do código -->
    <div class="flex-container">
      <!--
        O comentário abaixo vai servir de referência para 
        preenchimento do componente dropdown 
      -->       
      <!-- <mat-form-field class="input-container" appearance="outline">
        <mat-label>Origem</mat-label>
        <mat-icon matPrefix>
          flight_takeoff
        </mat-icon>
        <input matInput placeholder="Origem">
        <mat-icon matSuffix>search</mat-icon>
      </mat-form-field> -->
      <app-dropdown-uf/>
      <button mat-icon-button>
        <mat-icon>sync_alt</mat-icon>
      </button>
      <app-dropdown-uf/>
      <!--
        O comentário abaixo vai servir de referência para 
        preenchimento do componente dropdown 
      -->
      <!-- <mat-form-field class="input-container" appearance="outline">
        <mat-label>Destino</mat-label>
        <mat-icon matPrefix>
          flight_land
        </mat-icon>
        <input matInput placeholder="Destino">
        <mat-icon matSuffix>search</mat-icon>
      </mat-form-field> -->
      <!-- Resto do código -->
    </div>
  </form>
</app-card>
```

## Recebendo os inputs
Vamos importar o módulo do componente `MatAutocomplete` em `app.module.ts`:
```TypeScript
// frontend\src\app\app.module.ts
import { NgModule } from '@angular/core';
// resto do código
import { MatAutocompleteModule } from '@angular/material/autocomplete';
@NgModule({
  // Resto do código
  imports: [
    MatAutocompleteModule,
  ],
  // Resto do código
})
export class AppModule { }
```

Agora vamos definir os parâmetros de entrada do componente `DropdownUfComponent`:
```TypeScript
// frontend\src\app\shared\form-busca\dropdown-uf\dropdown-uf.component.ts
import { Component, Input } from '@angular/core';

@Component({
  // Resto do código
})
export class DropdownUfComponent {
  @Input() label: String = ''
  @Input() iconePrefixo: String = ''

  filteredOptions = []
}
```
> Os parâmetros de entrada podem ser inicializados ou __podem ser declarados sem inicialização__, desde que sejam sufixados com um ponto de exclamação:
> ```TypeScript
> export class MeuComponent {
>   @Input() label!: String
> }
> ```

Agora vamos ao HTML do componente:
```HTML
<!-- frontend\src\app\shared\form-busca\dropdown-uf\dropdown-uf.component.html -->
<mat-form-field class="input-container" appearance="outline">
  <mat-label>{{ label }}</mat-label>
  <mat-icon matPrefix>
    {{ iconePrefixo }}
  </mat-icon>
  <input matInput [matAutocomplete]="meuId">
  <mat-icon matSuffix>search</mat-icon>
  <mat-autocomplete #meuId="matAutocomplete">
    <mat-option *ngFor="let option of filteredOptions" [value]="option">
      {{option}}
    </mat-option>
  </mat-autocomplete>
</mat-form-field>
```
> Note que o atributo placeholder foi removido tanto do HTML quanto do TypeScript.

Outro ponto interessante é que o componente `MatAutocomplete` ele é isolado do campo de entrada. Para ligar o campo de entrada ao componente de autocomplete, é necessário:
1. dentro de `<mat-autocomplete>`, atribuir o valor `matAutocomplete` a uma ID de nome aleatório prefixada com cerquilha (`<mat-autocomplete #meuId="matAutocomplete">`); e
2. dentro do campo de entrada `<input>`, atribuir a ID à propriedade `[matAutocomplete]`, com as chaves e sem a cerquilha (`<input matInput [matAutocomplete]="meuId">`)

> Houve mudanças nos SCSS, mas que não tem muito relevância para o curso.

Perceba a lista `filteredOptions` declarada dentro de `<mat-option>`. Ela é obtida a partir do Type Script do `DropdownUfComponent`. Por enquanto a lista está vazia e não está tipada. Note também que o valor de cada opção por enquanto corresponde ao elemento (como um todo) da lista. Destaque focado no HTML do componente:
```HTML
<mat-autocomplete #meuId="matAutocomplete">
  <mat-option *ngFor="let option of filteredOptions" [value]="option">
    {{option}}
  </mat-option>
</mat-autocomplete>
```
## Controles do form
Veja os comentários do Type Script do componente `DropdownUfComponent`:

```TypeScript
// frontend\src\app\shared\form-busca\dropdown-uf\dropdown-uf.component.ts
import { UnidadeFederativa } from 'src/app/core/types/type';
import { UnidadeFederativaService } from './../../../core/services/unidade-federativa.service';
import { Component, Input, OnInit } from '@angular/core';
import { map, Observable, startWith } from 'rxjs';
import { FormControl } from '@angular/forms';

@Component({
  // Resto do código
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
```

Mudança em `FormBuscaService` para implementar a procura pelos componentes do seu `FormGroup` interno (o objeto `formBusca`):
```TypeScript
// frontend\src\app\core\services\form-busca.service.ts
import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class FormBuscaService {
  formBusca: FormGroup
  constructor() {
    this.formBusca = new FormGroup({
      // O parâmetro FormControl é o valor padrão do componente.
      somenteIda: new FormControl(false),
      origem: new FormControl(null),
      destino: new FormControl(null),
    })
  }

  obterControle(nome: string) : FormControl {
    const control = this.formBusca.get(nome)
    if (!control) {
      throw new Error(`Form control com nome "${nome}" não existe.`)
    }
    return control as FormControl
  }
}
```

Estruturação do HTML do componente `DropdownUfComponent`:
```HTML
<!-- frontend\src\app\shared\form-busca\dropdown-uf\dropdown-uf.component.html -->
<mat-form-field class="input-container" appearance="outline">
  <mat-label>{{ label }}</mat-label>
  <mat-icon matPrefix>
    {{ iconePrefixo }}
  </mat-icon>
  <input
    matInput
    [formControl]="control"
    [name]="label"
    ngDefaultControl
    [matAutocomplete]="meuId"
  >
  <mat-icon matSuffix>search</mat-icon>
  <mat-autocomplete #meuId="matAutocomplete">
    <mat-option *ngFor="let estado of opcoesFiltradas$ | async" [value]="estado.nome">
      {{ estado.nome }}
    </mat-option>
  </mat-autocomplete>
</mat-form-field>
```
> Note os elementos entre chaves no HTML: eles recebem objetos complexos ao invés de simples strings; o que está à direita é o objeto procurado do componente atual (no caso, o `DropdownUfComponent`).
> 1. `[formControl]` recebe o objeto de nome `control` localizado no TypeScript do `DropdownUfComponent`.
> 2. `[name]` recebe o objeto de nome `label` localizado no TypeScript do `DropdownUfComponent`.
> 3. `[matAutocomplete]` recebe um objeto complexo do tipo `MatAutocompleteComponent`. O `MatautocompleteComponent` é criado dentro do HTML do `DropdownUfComponent`. O `MatAutocompleteComponent` recebe uma ID (no exemplo, #meuId), e é referenciado na propriedade `[matAutocomplete]` do componente `DropdownUfComponent`.

Agora, a estrutura do HTML do componente pai `FormBuscaComponent`:
```HTML
<!-- frontend\src\app\shared\form-busca\form-busca.component.html -->

<!-- Resto do código -->
<app-dropdown-uf label="Origem" iconePrefixo="flight_takeoff" [control]="formBuscaService.obterControle('origem')"/>
<!-- Resto do código -->
<app-dropdown-uf label="Destino" iconePrefixo="flight_land" [control]="formBuscaService.obterControle('destino')"/>
<!-- Resto do código -->
```

> Note que a propriedade `[control]` recebe um objeto complexo (não a string contida entre as aspas) retornado da função `obterControle` do objeto `formBuscaService` do compoonente.

# Controlando a modal
## Abertura e fechamento
O código agora consiste em migrar código do componente `FormBuscaComponent` para o serviço `FormBuscaService`.

Remoção do código de `FormBuscaComponent`:
```TypeScript
// frontend\src\app\shared\form-busca\form-busca.component.ts
import { Component } from '@angular/core';
import { FormBuscaService } from 'src/app/core/services/form-busca.service';

@Component({
  // Resto do código
})
export class FormBuscaComponent {
  constructor(
    public formBuscaService: FormBuscaService
  ) {}
}
```

Acréscimo do código em `FormBuscaService`:
```TypeScript
// frontend\src\app\core\services\form-busca.service.ts
import { Injectable } from '@angular/core';
// Resto do código
import { MatDialog } from '@angular/material/dialog';
import { ModalComponent } from 'src/app/shared/modal/modal.component';

@Injectable({
  providedIn: 'root'
})
export class FormBuscaService {
  formBusca: FormGroup
  constructor(
    private dialog: MatDialog,
  ) {
    // Resto do código
  }

  // Resto do código
  openDialog() {
    this.dialog.open(ModalComponent, {
      width: '50%'
    })
  }
}
```

Atualização do HTML do componente `FormBuscaComponent` para referenciar a função distribuída para o serviço `FormBuscaService`:
```HTML
<!-- frontend\src\app\shared\form-busca\form-busca.component.html -->
<!-- Resto do código -->
  <mat-chip-listbox aria-label="Seleção de passagens">
    <mat-chip (click)="formBuscaService.openDialog()">
      <!-- Resto do código -->
    </mat-chip>
    <mat-chip (click)="formBuscaService.openDialog()">
      <!-- Resto do código -->
    </mat-chip>
  </mat-chip-listbox>
<!-- Resto do código -->
```

> Mudanças no SCSS foram feitas, mas não são de destaque para o curso.

## Chips e o form control
A aula visa controlar o estado de um `MaterialChipListbox`.

Vamos mudar o serviço `FormBuscaService`:
```TypeScript
// frontend\src\app\core\services\form-busca.service.ts
// Resto do código
import { MatChipSelectionChange } from '@angular/material/chips';
// Resto do código
@Injectable({
  providedIn: 'root'
})
export class FormBuscaService {
  constructor(
    private dialog: MatDialog,
  ) {
    this.formBusca = new FormGroup({
      // Resto do código
      tipo: new FormControl("Econômica"),
    })
  }
  // Resto do código
  alterarTipo(evento: MatChipSelectionChange, tipo: string) {
    if (evento.selected) {
      // `patchValue` é um método para mudança parcial do objeto FormGroup.
      this.formBusca.patchValue({tipo}) 
      console.log(`Tipo de passagem alterado para: ${this.formBusca.get('tipo')?.value}`)
    }
  }
}
```
> Note o tipo de evento fornecido como primeiro parâmetro do método `alterarTipo`: é o evento do tipo `MatChipSelectionChange`.

O serviço vai ser referenciado no componente `ModalComponent`:
```TypeScript
// frontend\src\app\shared\modal\modal.component.ts
import { Component } from '@angular/core';
import { FormBuscaService } from 'src/app/core/services/form-busca.service';

@Component({
  // Resto do código
})
export class ModalComponent {
  constructor(
    public formBuscaService: FormBuscaService
  ){}
}
```

```HTML
<!-- frontend\src\app\shared\modal\modal.component.html -->
<!-- Resto do código -->
  <mat-chip-listbox aria-label="Seleção de passagens">
    <mat-chip-option
      value="Econômica"
      [selected]="formBuscaService.formBusca.get('tipo')?.value === 'Econômica'"
      (selectionChange)="formBuscaService.alterarTipo($event, 'Econômica')"
    >
      Econômica
    </mat-chip-option>
    <mat-chip-option
      value="Executiva"
      [selected]="formBuscaService.formBusca.get('tipo')?.value === 'Executiva'"
      (selectionChange)="formBuscaService.alterarTipo($event, 'Executiva')"
    >
      Executiva
    </mat-chip-option>
  </mat-chip-listbox>
<!-- Resto do código -->
```
> Repare que a propriedade `[selected]` espera um booleano, não uma string. Por isso está entre chaves.
> Note também que há um event binding para `(selectionChange)`. Isso permite a mudança de estado do MatChipListbox, conforme método alterarTipo no serviço `FormBuscaService`.

## Descrição de passageiros
```HTML
 <!-- frontend\src\app\shared\form-busca\form-busca.component.html -->
<!-- Resto do código -->
  <mat-chip-listbox aria-label="Seleção de passagens">
    <mat-chip (click)="formBuscaService.openDialog()">
      <div class="inner">
        <mat-icon>check</mat-icon>
        {{ formBuscaService.getDescricaoPassageiros() }}
      </div>
    </mat-chip>
    <!-- Resto do código -->
  </mat-chip-listbox>
<!-- Resto do código -->
```
> Destaque para a interpolação dentro da div de class `inner`: ela vai conter o texto que mostra o número de passageiros e seu tipo (exemplo: 2 adultos, 2 crianças, 1 bebê).

Lógica do serviço `FormBuscaService`:
```TypeScript
// frontend\src\app\core\services\form-busca.service.ts
// Resto do código
@Injectable({
  providedIn: 'root'
})
export class FormBuscaService {
  formBusca: FormGroup
  constructor(
    private dialog: MatDialog,
  ) {
    this.formBusca = new FormGroup({
      // Resto do código
      adultos: new FormControl(1),
      criancas: new FormControl(0),
      bebes: new FormControl(0),
    })
  }
  // Resto do código
  getDescricaoPassageiros() {
    let descricao = ''
    const controles = {'adultos' : 'adulto', 'criancas' : 'criança', 'bebes' : 'bebê'}
    Object.entries(controles).forEach(array_controle => {
      const nome_controle = array_controle[0]
      const label_controle = array_controle[1]

      const controle = this.formBusca.get(nome_controle)?.value
      if (controle && controle > 0) {
        descricao += `${controle} ${label_controle}${controle > 1 ? 's' : ''}, `
      }
    })
    descricao = descricao.substring(0, descricao.length -2)
    return descricao
  }
}
```
> 1. O objeto `controles` é um dicionário em que os nomes dos controles são as chaves e o nome em português é o valor;
> 2. O método `Object.entries(dicionario)` cria um iterável a partir de um dicionário;
> 3. O método `forEach` do iterável vai receber um array que chamamos de `array_controle` com duas posições (no caso o key/value);
> 4. O Type Script permite o uso de um operador ternário: `condicao ? 'valor_verdadeiro' : 'valor_falso'`.

# Ajustes finais
## Componente de passageiros
Vamos refatorar a seleção de passageiros (ela vai variar em função do tipo de passageiro - adulto, criança ou bebê). Ele está localizado em `ModalComponent`.

```bash
ng g c shared/seletor-passageiro
# Output
CREATE src/app/shared/seletor-passageiro/seletor-passageiro.component.html (33 bytes)
CREATE src/app/shared/seletor-passageiro/seletor-passageiro.component.spec.ts (637 bytes)
CREATE src/app/shared/seletor-passageiro/seletor-passageiro.component.ts (250 bytes) 
CREATE src/app/shared/seletor-passageiro/seletor-passageiro.component.scss (0 bytes) 
UPDATE src/app/app.module.ts (3070 bytes)
```

Vamos definir o Type Script do novo componente:
```TypeScript
// frontend\src\app\shared\seletor-passageiro\seletor-passageiro.component.ts
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-seletor-passageiro',
  templateUrl: './seletor-passageiro.component.html',
  styleUrls: ['./seletor-passageiro.component.scss']
})
export class SeletorPassageiroComponent {
  @Input() titulo: string = 'Titulo'
  @Input() subtitulo: string = 'Subtitulo'
}
```
Os pontos de entrada serão `titulo` e `subtitulo` serão preenchidos na invocação do componente `SeletorPassageiroComponent`.
```HTML
<!-- frontend\src\app\shared\seletor-passageiro\seletor-passageiro.component.html -->
<ul>
  <li><strong>{{ titulo }}</strong></li>
  <li>{{ subtitulo }}</li>
  <li>
    <app-botao-controle operacao="decrementar"></app-botao-controle>
    <span>1</span>
    <app-botao-controle operacao="incrementar"></app-botao-controle>
  </li>
</ul>
```

Mudanças no HTML do componente `ModalComponent`:
```HTML
<!-- frontend\src\app\shared\modal\modal.component.html -->
<section class="modal">
  <h1 mat-dialog-title>Viajante</h1>
  <div mat-dialog-content>
    <div class="selecao-idade">
      <app-seletor-passageiro titulo="Adultos" subtitulo="(Acima de 12 anos)"/>
      <app-seletor-passageiro titulo="Crianças" subtitulo="(Entre 2 e 11 anos)"/>
      <app-seletor-passageiro titulo="Bebês" subtitulo="(Até 2 anos)"/>
    </div>
    <!-- Resto do código -->
  </div>
</section>
```

> Houve mudanças nos SCSS dos dois HTMLs, mas essa mudança não é relevante pro entendimento do Angular.

## Implementando o ControlValueAccessor
`ControlValueAccessor` é uma interface dos formulários do Angular. Ele força a implementação de 4 métodos: 
1. `writeValue(val: any): void`;
2. `registerOnChange(fn: any): void`;
3. `registerOnTouched(fn: any): void`;
4. `setDisabledState?(isDisabled: boolean): void`.

Vamos mudar o componente `SeletorPassageiroComponent`:
```TypeScript
// frontend\src\app\shared\seletor-passageiro\seletor-passageiro.component.ts
import { Component, Input } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';

@Component({
  // Resto do código
})
export class SeletorPassageiroComponent implements ControlValueAccessor {
  // Resto do código

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
```

Nas próximas aulas haverá mais detalhes dos eventos personalizados `onChange` e `onTouch`.

## Para saber mais: ControlValueAccessor
- `writeValue(val: any)`: atualiza o valor do componente.
- `registerOnChange(fn: any)`: registra o evento que vai tratar a mudança de valor do componente e notifica o Angular Forms sobre as mudanças.
- `registerOnTouched(fn: any)`: evento disparado quando o valor do componente muda.
- `setDisabledState?(isDisabled: boolean)`: personaliza o estado de desabilitado do componente.

## Alterando o valor
Mudança do HTML do componente `SeletorPassageiroComponent`
```HTML
<!-- frontend\src\app\shared\seletor-passageiro\seletor-passageiro.component.html -->
<ul>
  <!-- Resto do código -->
  <li>
    <app-botao-controle
      operacao="decrementar"
      (click)="decrementar()"
    />
    <span>{{ value }}</span>
    <app-botao-controle
      operacao="incrementar"
      (click)="incrementar()"
    />
  </li>
</ul>
```


```TypeScript
// frontend\src\app\shared\seletor-passageiro\seletor-passageiro.component.ts
// Resto do código
export class SeletorPassageiroComponent implements ControlValueAccessor {
  // Resto do código
  onChange = (val: number) => {}
  onTouch = () => {}

  // Resto do código
  registerOnChange(fn: any): void {
    this.onChange = fn // A função fn é atribuída para onChange.
  }
  registerOnTouched(fn: any): void {
    this.onChange = fn // A função fn é atribuída para onTouch.
  }

  // Resto do código
  incrementar() {
    this.value++
    this.onChange(this.value)
    this.onTouch()
  }
  decrementar() {
    if(this.value > 0) {
      this.value--
      this.onChange(this.value)
      this.onTouch()
    }
  }
}
```
> O event binding `click` vai chamar as operações `incrementar()` e `decrementar()`. Cada uma dessas operações chama os dois métodos que serão modificados pela implementação da interface `ControlValueAccessor`.

## Finalizando o serviço
Destaque na mudança do HTML do `ModalComponent`:
```HTML
<!-- frontend\src\app\shared\modal\modal.component.html -->
<!-- Resto do código -->
  <app-seletor-passageiro 
    [formControl]="formBuscaService.obterControle('adultos')" 
    titulo="Adultos" 
    subtitulo="(Acima de 12 anos)"
  />
  <app-seletor-passageiro 
    [formControl]="formBuscaService.obterControle('criancas')" 
    titulo="Crianças" 
    subtitulo="(Entre 2 e 11 anos)"
  />
  <app-seletor-passageiro 
    [formControl]="formBuscaService.obterControle('bebes')" 
    titulo="Bebês" 
    subtitulo="(Até 2 anos)"
  />
<!-- Resto do código -->
```

A mudança foi no acréscimo da propriedade `[formControl]`. Em teoria, ela deveria ser suficiente para que os spinners funcionassem, mas o seguinte erro aparece: 
```
ERROR RuntimeError: NG01203: No value accessor for form control unspecified name attribute. 
Find more at https://angular.io/errors/NG01203
```

Esse erro aparece porque faltaram algumas configurações no componente `SeletorPassageiroComponent`, de maneira a expor alguns serviços faltantes por meio do vetor `providers`:
```TypeScript
// frontend\src\app\shared\seletor-passageiro\seletor-passageiro.component.ts
import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-seletor-passageiro',
  templateUrl: './seletor-passageiro.component.html',
  styleUrls: ['./seletor-passageiro.component.scss'],
  providers: [ // Relaciona os serviços que podem ser expostos pelo módulo/componente.
    {
      // NG_VALUE_ACCESSOR: Serviço de ControlValueAccessor para comunicação com o formulário.
      provide: NG_VALUE_ACCESSOR, 
      // forwardRef: referencia um Componente declarado depois deste dicionário.
      // No caso, a referência é ao próprio SeletorPassageiroComponent, cujo conteúdo
      // ainda será explicitado.
      useExisting: forwardRef(() => SeletorPassageiroComponent),
      // multi: informa se o provider pode fornecer múltiplas diretivas.
      multi: true, // Sim, o componente é um multi-provider.
    }
  ]
})
export class SeletorPassageiroComponent implements ControlValueAccessor {
  // Resto do código
}
```

Vamos definir o que acontece ao submeter o formulário de `FormBuscaComponent`:
```HTML
<!-- frontend\src\app\shared\form-busca\form-busca.component.html -->
<!-- Resto do código -->
  <form [formGroup]="formBuscaService.formBusca" (ngSubmit)="buscar()">
<!-- Resto do código -->
```

O event binding `(ngSubmit)` está procurando o método `buscar()` que ainda não está implementado no componente `FormBuscaComponent`. Vamos implementar apenas a impressão no `console.log` ao submeter o formulário:
```TypeScript
// frontend\src\app\shared\form-busca\form-busca.component.ts
// Resto do código
export class FormBuscaComponent {
  // Resto do código
  buscar() {
    console.log(this.formBuscaService.formBusca.value)
  }
}
```

## Desafio: depoimentos dinâmicos e buscando controles
Hierarquia dos componentes:
Home > Depoimentos > CardDepoimento > Interface Depoimento

Atualizando o arquivo `types.ts` para inserir a interface de `Depoimento`:
```TypeScript
// frontend\src\app\core\types\type.ts
// Resto do código
export interface Depoimento {
  id: number
  texto: string
  autor: string
  avatar: string
}
```

Criando o serviço de depoimento:
```bash
ng g s core/services/depoimento
# Output
CREATE src/app/core/services/depoimento.service.spec.ts (377 bytes)
CREATE src/app/core/services/depoimento.service.ts (139 bytes)
```

Implementação do serviço `DepoimentoService`:
```TypeScript
// frontend\src\app\core\services\depoimento.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Depoimento } from '../types/type';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DepoimentoService {
  apiUrl = environment.apiUrl
  constructor(private http: HttpClient) { }

  listar() : Observable<Depoimento[]> {
    return this.http.get<Depoimento[]>(`${this.apiUrl}/depoimentos`)
  }
}
```

Mudança no Type Script do componente `CardDepoimento`:
```TypeScript
// frontend\src\app\shared\card-depoimento\card-depoimento.component.ts
import { Component, Input } from '@angular/core';
import { Depoimento } from 'src/app/core/types/type';

@Component({
  // Resto do código
})
export class CardDepoimentoComponent {
  @Input() depoimento!: Depoimento
}
```

Mudança no HTML do componente `CardDepoimento`:
```HTML
<!-- frontend\src\app\shared\card-depoimento\card-depoimento.component.html -->
<mat-card class="depoimento">
  <mat-card-content>
    <img src="{{ depoimento.avatar }}" alt="Avatar da pessoa autora do depoimento">
    <ul>
      <li>{{ depoimento.texto }}</li>
      <li>
        <strong>{{ depoimento.autor }}</strong>
      </li>
    </ul>
  </mat-card-content>
</mat-card>
```
> Note que o HTML está referenciando o objeto `depoimento`, mas que ele ainda não tem atribuição explícita. Essa atribuição é feita pelo componente pai, no caso seria o novo componente `DepoimentoComponent`.


Criando o componente de depoimento `DepoimentoComponent` (que vai englobar o componente `CardDepoimentoComponent`):
```bash
ng g c pages/home/depoimentos
# Output
CREATE src/app/pages/home/depoimentos/depoimentos.component.html (26 bytes)
CREATE src/app/pages/home/depoimentos/depoimentos.component.spec.ts (594 bytes)
CREATE src/app/pages/home/depoimentos/depoimentos.component.ts (223 bytes)
CREATE src/app/pages/home/depoimentos/depoimentos.component.scss (0 bytes)
UPDATE src/app/app.module.ts (3184 bytes)
```

Implementação TypeScript de `DepoimentoComponent`:
```TypeScript
// frontend\src\app\pages\home\depoimentos\depoimentos.component.ts
import { DepoimentoService } from 'src/app/core/services/depoimento.service';
import { Component } from '@angular/core';
import { Depoimento } from 'src/app/core/types/type';

@Component({
  // Resto do código
})
export class DepoimentosComponent {
  depoimentos! : Depoimento[]
  constructor(
    private service : DepoimentoService,
  ) {
    // Outra forma é jogar estes comandos para ngOnInit()
    this.service.listar().subscribe(
      resposta => this.depoimentos = resposta
    )
  }
}
```
> Note que o método `DepoimentoService.listar()` retorna um `Observable`, as a lista de depoimentos é um array. É necessário fazer essa conversão de `Observable` por array usando o método `subscribe` do `Observable`.

Implementação do HTML de `DepoimentoComponent`:
```HTML
<!-- frontend\src\app\pages\home\depoimentos\depoimentos.component.html -->
<div class="card-wrapper">
  <app-card-depoimento *ngFor="let item of depoimentos" [depoimento]="item"/>
</div>
```
> Note que cada `CardDepoimentoComponent` só recebe seu respectivo depoimento após o data binding em `DepoimentoComponent`. O `item` da diretiva `ngFor` é atribuído à propriedade `depoimento` de `CardDepoimentoComponent`.

Finalmente, a mudança na página principal (`HomeComponent`):
```HTML
<!-- frontend\src\app\pages\home\home.component.html -->
<section class="homepage">
  <!-- Resto do código -->
  <app-container>
    <!-- Resto do código -->
    <h2>Depoimentos</h2>
    <app-depoimentos/> <!-- Inserção do componente -->
  </app-container>
  <!-- Resto do código -->
</section>
```
