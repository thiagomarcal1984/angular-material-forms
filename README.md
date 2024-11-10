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
