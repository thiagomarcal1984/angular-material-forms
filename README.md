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

## Analisando o form de busca
Vamos criar o serviço do form-busca:

```bash
PS D:\alura\angular-material-forms\frontend> ng g s core/services/form-busca
CREATE src/app/core/services/form-busca.service.spec.ts (373 bytes)
CREATE src/app/core/services/form-busca.service.ts (138 bytes)
```

O serviço vai simplesmente instanciar um objeto `FormGroup` do Angular. A ideia é permitir reúso do formulário desse serviço em diferentes componentes.

```TypeScript
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
