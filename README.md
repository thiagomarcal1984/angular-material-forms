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
