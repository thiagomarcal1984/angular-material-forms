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
