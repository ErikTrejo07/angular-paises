import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of, map, tap } from 'rxjs';

import { Country } from '../interfaces/country.interface';
import { CacheStorege } from '../interfaces/cache-storege.interface';
import { Region } from '../interfaces/region.type';

@Injectable({ providedIn: 'root' })
export class CountriesService {

  private apiUrl: string = 'https://restcountries.com/v3.1';

  public cacheStorege: CacheStorege = {
    byCapital: { term: '', countries: [] },
    byCountries: { term: '', countries: [] },
    byRegion: { region: '', countries: [] }
  }

  constructor(private http: HttpClient ) {
    this.loadFromLocalStorage();
  }

  private saveToLocalStorage() {
    localStorage.setItem( 'cacheStorege', JSON.stringify( this.cacheStorege ) );
  }

  private loadFromLocalStorage() {
    if ( !localStorage.getItem('cacheStorege') ) return;

    this.cacheStorege = JSON.parse( localStorage.getItem('cacheStorege')! );

  }

  private getCountriesRequest( url: string ): Observable<Country[]> {
    return this.http.get<Country[]>( url )
      .pipe(
        catchError( () => of([]) )
      );
  }

  searchCountryByAlphaCode( code: string ): Observable<Country | null> {

    const url = `${ this.apiUrl }/alpha/${ code }`;

    return this.http.get<Country[]>( url )
      .pipe(
        map( countries => countries.length > 0 ? countries[0]: null ),
        catchError( () => of(null) ),
        //delay( 2000 ),
      );
  }

  searchCapital( term: string ): Observable<Country[]> {

    const url = `${ this.apiUrl }/capital/${ term }`;
    return this.getCountriesRequest( url )
      .pipe(
        tap( countries => this.cacheStorege.byCapital = { term, countries } ),
        tap( () => this.saveToLocalStorage() ),

      );
  }

  searchCountry( term: string ): Observable<Country[]> {

    const url = `${ this.apiUrl }/name/${ term }`;
    return this.getCountriesRequest( url )
      .pipe(
        tap( countries => this.cacheStorege.byCountries = { term, countries} ),
        tap( () => this.saveToLocalStorage() ),
      );
  }

  searchRegion( region: Region ): Observable<Country[]> {

    const url = `${ this.apiUrl }/region/${ region }`;
    return this.getCountriesRequest( url )
      .pipe(
        tap( countries => this.cacheStorege.byRegion = { region, countries } ),
        tap( () => this.saveToLocalStorage() ),
      );
  }


}
