import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import api from '../../services/api';

import Container from '../../components/Container/index';
import { Loading, Owner, IssueList } from './styles';

export default class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    repository: {},
    issues: [],
    loading: true,
    state: 'open',
    page: 1,
  };

  async componentDidMount() {
    const { match } = this.props;
    const { state } = this.state;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state,
          per_page: 30,
        },
      }),
    ]);
    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  setAll = async () => {
    const { match } = this.props;
    const { page } = this.state;

    const repoName = decodeURIComponent(match.params.repository);
    const response = await api.get(`/repos/${repoName}/issues`, {
      params: {
        state: 'all',
        page,
        per_page: 30,
      },
    });
    this.setState({
      issues: response.data,
      state: 'all',
    });
  };

  setOpen = async () => {
    const { match } = this.props;
    const { page } = this.state;

    const repoName = decodeURIComponent(match.params.repository);
    const response = await api.get(`/repos/${repoName}/issues`, {
      params: {
        state: 'open',
        page,
        per_page: 30,
      },
    });
    this.setState({
      issues: response.data,
      state: 'open',
    });
  };

  setClosed = async () => {
    const { match } = this.props;
    const { page } = this.state;

    const repoName = decodeURIComponent(match.params.repository);
    const response = await api.get(`/repos/${repoName}/issues`, {
      params: {
        state: 'closed',
        page,
        per_page: 30,
      },
    });
    this.setState({
      issues: response.data,
      state: 'closed',
    });
  };

  previousPage = async () => {
    const { match } = this.props;
    const { state, page } = this.state;

    const repoName = decodeURIComponent(match.params.repository);
    const response = await api.get(`/repos/${repoName}/issues`, {
      params: {
        state,
        page: page - 1,
        per_page: 30,
      },
    });

    this.setState({
      issues: response.data,
      state,
      page: page - 1,
    });
  };

  nextPage = async () => {
    const { match } = this.props;
    const { state, page } = this.state;

    const repoName = decodeURIComponent(match.params.repository);
    const response = await api.get(`/repos/${repoName}/issues`, {
      params: {
        state,
        page: page + 1,
        per_page: 30,
      },
    });

    this.setState({
      issues: response.data,
      state,
      page: page + 1,
    });
  };

  render() {
    const { repository, issues, loading, page, state } = this.state;

    if (loading) {
      return <Loading>Carregando</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
          <span>Filter Issues: </span>
          <div>
            <button
              onClick={state !== 'all' ? this.setAll : null}
              type="submit"
            >
              All
            </button>
            <button
              onClick={state !== 'open' ? this.setOpen : null}
              type="submit"
            >
              Open
            </button>
            <button
              onClick={state !== 'closed' ? this.setClosed : null}
              type="submit"
            >
              Closed
            </button>
          </div>
        </Owner>

        <IssueList page={page}>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div className="content">
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
          <div className="pages">
            <button
              className="previous"
              onClick={page !== 1 ? this.previousPage : null}
              type="submit"
            >
              Página Anterior
            </button>
            <button onClick={page <= 100 ? this.nextPage : null} type="submit">
              Próxima Página
            </button>
          </div>
        </IssueList>
      </Container>
    );
  }
}
