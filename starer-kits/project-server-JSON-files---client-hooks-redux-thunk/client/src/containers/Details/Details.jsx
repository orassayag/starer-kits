import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { detailsActions, mainActions } from '../../store/actions/actions';
import movieService from '../../services/movie.service';
import movieUtils from '../../utils/movie.utils';
import './Details.scss';
import { ActorsList, CrewsList, Rating, Trailer, FeaturesList, ProductionsList, ButtonClick, PageTitle } from '../../components';

const propTypes = {};
const defaultProps = {};

const Details = (props) => {
	const dispatch = useDispatch();
	const movie = useSelector((state) => state.details.movie);
	const youtubeKey = useSelector((state) => state.details.youtubeKey);
	const actorsList = useSelector((state) => state.details.actorsList);
	const crewsList = useSelector((state) => state.details.crewsList);
	const moviesList = useSelector((state) => state.main.moviesList);
	const favoriteMoviesList = useSelector((state) => state.main.favoriteMoviesList);
	const onMovieDetailsLoadSuccess = (request) => dispatch(detailsActions.setMovieDetails(request));
	const onUpdateFavoriteMoviesSuccess = (request) => dispatch(mainActions.updateFavoriteMoviesSuccess(request));

	const handleBackClick = () => {
		props.history.push(`/`);
	};

	useEffect(() => {
		const loadDetails = async () => {
			const movieId = props.match.params.id;
			if (!movieId) {
				handleBackClick();
				return;
			}
			const movie = await movieService.getMovie(movieId);
			if (!movie || movie.length <= 0) {
				handleBackClick();
				return;
			}
			onMovieDetailsLoadSuccess({
				movie: movie,
				youtubeKey: movie.youtubeKey,
				actorsList: movieUtils.removeDuplicates(movie.actorsList, 'name'),
				crewsList: movieUtils.removeDuplicates(movie.crewsList, 'name')
			});
		};
		loadDetails();
		return () => {
			onMovieDetailsLoadSuccess({
				movie: null,
				youtubeKey: null,
				actorsList: null,
				crewsList: null
			});
		};
	}, []);

	const numberWithCommas = (number) => {
		return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	};

	const handleFavoriteMovieClick = () => {
		const { id, name, poster_path } = movie;
		onUpdateFavoriteMoviesSuccess({
			updatedMovie: { id: id, name: name, posterId: poster_path },
			favoriteMoviesList: favoriteMoviesList,
			moviesList: moviesList
		});
	};

	const handleUpdateMovieClick = () => {
		props.history.push(`/form/${movie.id}`);
	};

	if (!movie) {
		return null;
	}
	const { adult, poster_path, budget, genres, homepage, imdb_id, original_language, original_title,
		overview, popularity, production_companies, production_countries, release_date, revenue, runtime, spoken_languages,
		status, tagline, title, video, vote_average, vote_count } = movie;
	const genresText = genres.map(genre => genre.name).join(', ');
	const countriesText = production_countries.map(country => country.name).join(', ');
	const languagesText = spoken_languages.map(language => language.name).join(', ');
	const featuresList = [
		{ item: 'Release Date', value: release_date },
		{ item: 'Budget', value: `$${numberWithCommas(budget)}` },
		{ item: 'Revenue', value: `$${numberWithCommas(revenue)}` },
		{ item: 'Length', value: `${runtime} minutes` },
		{ item: 'Popularity', value: popularity },
		{ item: 'Original Title', value: original_title },
		{ item: 'For Adults', value: adult ? 'Yes' : 'No' },
		{ item: 'Original Language', value: original_language },
		{ item: 'Spoken Languages', value: languagesText },
		{ item: 'Countries', value: countriesText },
		{ item: 'Status', value: status },
		{ item: 'Is Video', value: video ? 'Yes' : 'No' }
	];
	const linksList = [];
	if (homepage) {
		linksList.push({ id: 1, name: 'Homepage', url: homepage });
	}
	if (imdb_id) {
		linksList.push({ id: 2, name: 'IMDB', url: `https://www.imdb.com/title/${imdb_id}` });
	}
	return (
		<div>
			<section className="details-area">
				<PageTitle
					pageName='details'
					pageTitle='Details'
				/>
				<ul className="details-content">
					<li className="details-left" style={{ backgroundImage: `url('https://image.tmdb.org/t/p/original${poster_path}')` }}></li>
					<li className="details-right">
						<h2>{title} ({release_date.substr(0, 4)})</h2>
						<p className="genres">{genresText}</p>
						<p className="description short">{tagline}</p>
						<Rating
							rating={vote_average}
							votesCount={numberWithCommas(vote_count)}
						/>
						<p className="description full">{overview}</p>
						<div className="extra">
							<FeaturesList
								featuresList={featuresList.slice(0, 5)}
								linksList={null}
								isFavorite={favoriteMoviesList.findIndex(favoriteMovie => parseInt(favoriteMovie.id) === parseInt(movie.id)) > -1}
								onFavoriteMovieClick={handleFavoriteMovieClick}
								onUpdateMovieClick={handleUpdateMovieClick}
							/>
							{youtubeKey && <Trailer
								youtubeKey={youtubeKey}
							/>}
						</div>
					</li>
					<div className="extra-features">
						<FeaturesList
							featuresList={featuresList.slice(5, featuresList.length)}
							linksList={linksList}
							isFavorite={null}
							onFavoriteMovieClick={null}
							onUpdateMovieClick={null}
						/>
						<ProductionsList
							productionsList={production_companies}
						/>
					</div>
				</ul>
			</section>
			<section className="actors-area">
				<PageTitle
					pageName='actors'
					pageTitle='Cast'
				/>
				<ActorsList
					actorsList={actorsList}
				/>
			</section>
			<section className="crew-area">
				<PageTitle
					pageName='crew'
					pageTitle='Crew'
				/>
				<CrewsList
					crewsList={crewsList}
				/>
			</section>
			<ButtonClick
				buttonText={'Back'}
				buttonTitle={'Back'}
				isLoading={false}
				onClick={handleBackClick}
			/>
		</div>
	);
};

Details.propTypes = propTypes;
Details.defaultProps = defaultProps;

export default Details;