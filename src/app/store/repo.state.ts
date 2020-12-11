import { State, Selector, Action, StateContext } from '@ngxs/store';
import { Repo } from './repo.model';
import { Injectable } from '@angular/core';
import { FetchAllRepos } from './repo.actions';
import { RepoService } from "../services/repo.service";
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';


export interface RepoStateModel {
  repoList: Repo[],
  pageNumber: number,
  loading: boolean,
  status: number,
  error: {
    message?: string,
    statusText?: string,
    troublshooot?: string
  }
}

@State<RepoStateModel>({
  name: 'repoList',
  defaults: {
    repoList: [],
    pageNumber: 1,
    loading: true,
    status: 200,
    error: {}
  }
})
@Injectable()
export class RepoState {
  constructor(private repoService: RepoService) { }

  @Selector()
  static getRepoList(state: RepoStateModel) {
    return state.repoList
  }

  @Selector()
  static isLoading(state: RepoStateModel) {
    return state.loading
  }

  @Action(FetchAllRepos)
  fetchRepos({ getState, setState, patchState }: StateContext<RepoStateModel>) {
    const state = getState();
    const pageNumber = state.pageNumber;
    const repoList = state.repoList;

    patchState({
      loading: true
    })
    
    return this.repoService.fetchRepos(pageNumber).pipe(
      tap((result) => {
        setState({
          ...state,
          repoList: [...repoList, ...result],
          pageNumber: pageNumber + 1,
          error: {},
          loading: false,
          status: 200
        })
      }), catchError((err) => {
        setState({
          ...state,
          status: err.status,
          error: {
            message: err.message,
            statusText: err.statusText,
            troublshooot: err.error.documentation_url
          },
          loading: false
        })
        return of('')
      })
    )
  }
}

