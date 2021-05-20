import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { formActions, mainActions } from '../../store/actions/actions';
import './Form.scss';
import {
	ActorBox, Boolean, ButtonClick, Check, CrewBox, DatePick, Dropdown,
	Field, LongText, MiniButton, PageLoader, PageTitle, ProductionBox
} from '../../components';
import cultureService from '../../services/culture.service';
import movieService from '../../services/movie.service';

const propTypes = {};
const defaultProps = {};

const generateId = () => {
	const min = 1;
	const max = 34359738368;
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

const statuses = ['Announced', 'Completed', 'Development', 'Filming', 'Optioned Property', 'Post-production',
	'Pre-production', 'Released', 'Script', 'Treatment/Outline', 'Turnaround'].map(status => { return { value: status, title: status }; });

const validURL = (url) => {
	const pattern = new RegExp('^(https?:\\/\\/)?' + // Protocol.
		'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // Domain name.
		'((\\d{1,3}\\.){3}\\d{1,3}))' + // Or IP (v4) address.
		'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // Port and path.
		'(\\?[;&a-z\\d%_.~+=-]*)?' + // Query string.
		'(\\#[-a-z\\d_]*)?$', 'i'); // Fragment locator.
	return !!pattern.test(url);
};

// Validates that the input string is a valid date formatted as 'mm/dd/yyyy'.
const isValidDate = (date) => {
	date = ((date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1))) + '/' + ((date.getDate() > 9) ? date.getDate() : ('0' + date.getDate())) + '/' + date.getFullYear();
	// First check for the pattern.
	if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(date)) {
		return false;
	}
	// Parse the date parts to integers.
	const parts = date.split('/');
	const day = parseInt(parts[1], 10);
	const month = parseInt(parts[0], 10);
	const year = parseInt(parts[2], 10);
	// Check the ranges of month and year.
	if (year < 1000 || year > 3000 || month == 0 || month > 12) {
		return false;
	}
	const monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
	// Adjust for leap years.
	if (year % 400 == 0 || (year % 100 != 0 && year % 4 == 0)) {
		monthLength[1] = 29;
	}
	// Check the range of the day.
	return day > 0 && day <= monthLength[month - 1];
};

class Actor {
	constructor(order) {
		this.id = generateId();
		this.character = '';
		this.gender = 2;
		this.name = '';
		this.profile_path = '';
		this.order = order;
		this.errorField = '';
		this.isRemoved = false;
	}
}

class Crew {
	constructor() {
		this.id = generateId();
		this.department = '';
		this.gender = 1;
		this.job = '';
		this.name = '';
		this.profile_path = '';
		this.errorField = '';
		this.isRemoved = false;
	}
}

class Production {
	constructor() {
		this.id = generateId();
		this.logo_path = '';
		this.name = '';
		this.origin_country = cultureService.getDropCountriesCode()[0].value;
		this.errorField = '';
		this.isRemoved = false;
	}
}

const Form = (props) => {
	const dispatch = useDispatch();
	const isLoading = useSelector((state) => state.form.isLoading);
	const id = useSelector((state) => state.form.id);
	const adult = useSelector((state) => state.form.adult);
	const poster_path = useSelector((state) => state.form.poster_path);
	const budget = useSelector((state) => state.form.budget);
	const genres = useSelector((state) => state.form.genres);
	const homepage = useSelector((state) => state.form.homepage);
	const imdb_id = useSelector((state) => state.form.imdb_id);
	const original_language = useSelector((state) => state.form.original_language);
	const original_title = useSelector((state) => state.form.original_title);
	const overview = useSelector((state) => state.form.overview);
	const popularity = useSelector((state) => state.form.popularity);
	const production_companies = useSelector((state) => state.form.production_companies);
	const production_countries = useSelector((state) => state.form.production_countries);
	const release_date = useSelector((state) => state.form.release_date);
	const revenue = useSelector((state) => state.form.revenue);
	const runtime = useSelector((state) => state.form.runtime);
	const spoken_languages = useSelector((state) => state.form.spoken_languages);
	const status = useSelector((state) => state.form.status);
	const tagline = useSelector((state) => state.form.tagline);
	const title = useSelector((state) => state.form.title);
	const video = useSelector((state) => state.form.video);
	const vote_average = useSelector((state) => state.form.vote_average);
	const vote_count = useSelector((state) => state.form.vote_count);
	const youtubeKey = useSelector((state) => state.form.youtubeKey);
	const actorsList = useSelector((state) => state.form.actorsList);
	const crewsList = useSelector((state) => state.form.crewsList);
	const isCreateMode = useSelector((state) => state.form.isCreateMode);
	const errorFieldName = useSelector((state) => state.form.errorFieldName);
	const statusMessage = useSelector((state) => state.form.statusMessage);
	const originalActorsList = useSelector((state) => state.form.originalActorsList);
	const originalCrewsList = useSelector((state) => state.form.originalCrewsList);
	const originalProductionsList = useSelector((state) => state.form.originalProductionsList);
	const genresList = useSelector((state) => state.main.genresList);
	const onSetForm = (fieldName, fieldValue) => dispatch(formActions.setForm(fieldName, fieldValue));
	const onSetFormStatus = (errorFieldName, statusMessage) => dispatch(formActions.setFormStatus(errorFieldName, statusMessage));
	const onLeaveForm = () => dispatch(formActions.setLeaveForm());
	const onInitExistsForm = (movie) => dispatch(formActions.setInitExistsForm(movie));
	const onSetGenresList = (genresList) => dispatch(mainActions.setGenresList(genresList));

	const handleBackClick = () => {
		props.history.push(`/`);
	};

	const setGenresList = async () => {
		const genresResults = await movieService.getGenres();
		onSetGenresList(genresResults);
	};

	useEffect(() => {
		// Check if update or create mode.
		const initForm = async () => {
			const movieId = props.match.params.id;
			if (!isNaN(movieId)) {
				const movie = await movieService.getMovie(movieId);
				if (!movie || movie.length <= 0) {
					handleBackClick();
					return;
				}
				onInitExistsForm(movie);
			}
			else {
				// Default Values.
				onSetForm('production_countries', [cultureService.getDropCountries()[0].value]);
				onSetForm('original_language', [cultureService.getDropLanguages()[0].value]);
				onSetForm('spoken_languages', [cultureService.getDropLanguages()[0].value]);
				onSetForm('status', [statuses[0].value]);
				onSetForm('isLoading', false);
			}

			if (!genresList || genresList.length === 0) {
				await setGenresList();
			}
		};
		initForm();
		return () => {
			onLeaveForm();
		};
	}, []);

	const handleOnSelectChange = (e) => {
		onSetForm(e.target.name, [e.target.value]);
	};

	const handleOnValueChange = (e) => {
		onSetForm(e.target.name, e.target.value);
	};

	const handleOnDateChange = useCallback((date) => {
		onSetForm('release_date', date);
	}, [release_date]);

	const handleOnCheckChange = useCallback((e) => {
		let updatedGenres = [...genres];
		if (e.target.checked) {
			updatedGenres.push(e.target.name);
		}
		else {
			updatedGenres = updatedGenres.filter(g => g !== e.target.name);
		}
		onSetForm('genres', updatedGenres);
	}, [genres]);

	// Actors.
	const updateActorsList = useCallback((isAdd, id) => {
		let updatedActorsList = [...actorsList];
		if (isAdd) {
			const actor = new Actor(updatedActorsList.length + 1);
			updatedActorsList.push(actor);
		}
		else {
			const actorIndex = updatedActorsList.findIndex(actor => parseInt(actor.id) === parseInt(id));
			updatedActorsList[actorIndex].isRemoved = true;
		}
		onSetForm('actorsList', updatedActorsList);
	}, [actorsList]);

	const handleOnActorBoxValueChange = useCallback((e) => {
		const updatedActorsList = [...actorsList];
		const id = e.target.dataset.id;
		const fieldName = e.target.name;
		const fieldValue = e.target.value;
		const actorIndex = actorsList.findIndex(actor => parseInt(actor.id) === parseInt(id));
		updatedActorsList[actorIndex][fieldName] = fieldValue;
		onSetForm('actorsList', updatedActorsList);
	}, [actorsList]);

	const handleOnRemoveActorBoxButtonClick = useCallback((e) => {
		updateActorsList(false, e.currentTarget.dataset.id);
	}, [actorsList]);

	const handleOnAddActorBoxButtonClick = useCallback(() => {
		updateActorsList(true, null);
	}, [actorsList]);

	// Crews.
	const updateCrewsList = useCallback((isAdd, id) => {
		let updatedCrewsList = [...crewsList];
		if (isAdd) {
			const crew = new Crew();
			updatedCrewsList.push(crew);
		}
		else {
			const crewIndex = updatedCrewsList.findIndex(crew => parseInt(crew.id) === parseInt(id));
			updatedCrewsList[crewIndex].isRemoved = true;
		}
		onSetForm('crewsList', updatedCrewsList);
	}, [crewsList]);

	const handleOnCrewBoxValueChange = useCallback((e) => {
		const updatedCrewsList = [...crewsList];
		const id = e.target.dataset.id;
		const fieldName = e.target.name;
		const fieldValue = e.target.value;
		const crewIndex = crewsList.findIndex(crew => parseInt(crew.id) === parseInt(id));
		updatedCrewsList[crewIndex][fieldName] = fieldValue;
		onSetForm('crewsList', updatedCrewsList);
	}, [crewsList]);

	const handleOnRemoveCrewBoxButtonClick = useCallback((e) => {
		updateCrewsList(false, e.currentTarget.dataset.id);
	}, [crewsList]);

	const handleOnAddCrewBoxButtonClick = useCallback(() => {
		updateCrewsList(true, null);
	}, [crewsList]);

	// Productions.
	const updateProductionsList = useCallback((isAdd, id) => {
		let updatedProductionsList = [...production_companies];
		if (isAdd) {
			const production = new Production();
			updatedProductionsList.push(production);
		}
		else {
			const productionIndex = updatedProductionsList.findIndex(production => parseInt(production.id) === parseInt(id));
			updatedProductionsList[productionIndex].isRemoved = true;
		}
		onSetForm('production_companies', updatedProductionsList);
	}, [production_companies]);

	const handleOnProductionBoxValueChange = useCallback((e) => {
		const updatedProductionsList = [...production_companies];
		const id = e.target.dataset.id;
		const fieldName = e.target.name;
		const fieldValue = e.target.value;
		const productionIndex = production_companies.findIndex(production => parseInt(production.id) === parseInt(id));
		updatedProductionsList[productionIndex][fieldName] = fieldValue;
		onSetForm('production_companies', updatedProductionsList);
	}, [production_companies]);

	const handleOnRemoveProductionBoxButtonClick = useCallback((e) => {
		updateProductionsList(false, e.currentTarget.dataset.id);
	}, [production_companies]);

	const handleOnAddProductionBoxButtonClick = useCallback(() => {
		updateProductionsList(true, null);
	}, [production_companies]);

	const updateProductionError = useCallback((id, errorField) => {
		const updatedProductionsList = [...production_companies];
		const productionIndex = production_companies.findIndex(production => parseInt(production.id) === parseInt(id));
		updatedProductionsList[productionIndex]['errorField'] = errorField;
		onSetForm('production_companies', updatedProductionsList);
	}, [production_companies]);

	const clearErrorProductions = useCallback(() => {
		const updatedProductionsList = [...production_companies].map(production => { return { ...production, errorField: '' }; });
		onSetForm('production_companies', updatedProductionsList);
	}, [production_companies]);

	const updateActorError = useCallback((id, errorField) => {
		const updatedActorsList = [...actorsList];
		const actorIndex = actorsList.findIndex(actor => parseInt(actor.id) === parseInt(id));
		updatedActorsList[actorIndex]['errorField'] = errorField;
		onSetForm('actorsList', updatedActorsList);
	}, [actorsList]);

	const clearErrorActors = useCallback(() => {
		const updatedActorsList = [...actorsList].map(actor => { return { ...actor, errorField: '' }; });
		onSetForm('actorsList', updatedActorsList);
	}, [actorsList]);

	const updateCrewError = useCallback((id, errorField) => {
		const updatedCrewsList = [...crewsList];
		const crewIndex = crewsList.findIndex(crew => parseInt(crew.id) === parseInt(id));
		updatedCrewsList[crewIndex]['errorField'] = errorField;
		onSetForm('crewsList', updatedCrewsList);
	}, [crewsList]);

	const clearErrorCrews = useCallback(() => {
		const updatedCrewsList = [...crewsList].map(crew => { return { ...crew, errorField: '' }; });
		onSetForm('crewsList', updatedCrewsList);
	}, [crewsList]);

	const isEquivalent = (a, b, properties) => {
		const aProps = Object.getOwnPropertyNames(a);
		for (let i = 0; i < aProps.length; i++) {
			const propName = aProps[i];
			if (properties.findIndex(p => p === propName) === -1) {
				continue;
			}
			if (a[propName] !== b[propName]) {
				return false;
			}
		}
		return true;
	};

	const setDataToUpdate = () => {
		const clientDeleteActorIdsList = [];
		const clientUpdateActorsList = [];
		const clientAddActorsList = [];
		const clientDeleteCrewIdsList = [];
		const clientUpdateCrewsList = [];
		const clientAddCrewsList = [];
		const clientDeleteProductionIdsList = [];
		const clientUpdateProductionsList = [];
		const clientAddProductionsList = [];

		// Actors.
		for (let i = 0; i < actorsList.length; i++) {
			const updatedActor = actorsList[i];
			const originalActor = originalActorsList.find(a => parseInt(a.id) === parseInt(updatedActor.id));
			if (!originalActor) {
				clientAddActorsList.push(updatedActor);
			}
			else if (updatedActor.isRemoved) {
				clientDeleteActorIdsList.push(updatedActor.id);
			}
			else {
				const isEquals = isEquivalent(originalActor, updatedActor, ['name', 'character', 'order', 'gender', 'profile_path']);
				if (!isEquals) {
					clientUpdateActorsList.push(updatedActor);
				}
			}
		}

		// Crews.
		for (let i = 0; i < crewsList.length; i++) {
			const updatedCrew = crewsList[i];
			const originalCrew = originalCrewsList.find(c => parseInt(c.id) === parseInt(updatedCrew.id));
			if (!originalCrew) {
				clientAddCrewsList.push(updatedCrew);
			}
			else if (updatedCrew.isRemoved) {
				clientDeleteCrewIdsList.push(updatedCrew.id);
			}
			else {
				const isEquals = isEquivalent(originalCrew, updatedCrew, ['name', 'job', 'department', 'gender', 'profile_path']);
				if (!isEquals) {
					clientUpdateCrewsList.push(updatedCrew);
				}
			}
		}

		// Productions.
		for (let i = 0; i < production_companies.length; i++) {
			const updatedProduction = production_companies[i];
			const originalProduction = originalProductionsList.find(p => parseInt(p.id) === parseInt(updatedProduction.id));
			if (!originalProduction) {
				clientAddProductionsList.push(updatedProduction);
			}
			else if (updatedProduction.isRemoved) {
				clientDeleteProductionIdsList.push(updatedProduction.id);
			}
			else {
				const isEquals = isEquivalent(originalProduction, updatedProduction, ['name', 'logo_path', 'origin_country']);
				if (!isEquals) {
					clientUpdateProductionsList.push(updatedProduction);
				}
			}
		}
		return {
			clientDeleteActorIdsList, clientUpdateActorsList, clientAddActorsList, clientDeleteCrewIdsList,
			clientUpdateCrewsList, clientAddCrewsList, clientDeleteProductionIdsList, clientUpdateProductionsList,
			clientAddProductionsList
		};
	};

	const submitForm = async () => {
		if (isCreateMode) {
			if (!poster_path) {
				onSetFormStatus('poster_path', '* Poster Path is required');
				return;
			}
		}
		if (isNaN(budget)) {
			onSetFormStatus('budget', '* Budget is invalid');
			return;
		}
		if (!genres || genres.length <= 0) {
			onSetFormStatus('genres', '* At least one genere is required');
			return;
		}
		if (isCreateMode) {
			if (!homepage) {
				onSetFormStatus('homepage', '* Homepage URL is required');
				return;
			}
		}
		if (homepage) {
			if (!validURL(homepage)) {
				onSetFormStatus('homepage', '* Homepage URL is invalid');
				return;
			}
		}
		if (!imdb_id) {
			onSetFormStatus('imdb_id', '* IMDB Id is required');
			return;
		}
		if (!original_title) {
			onSetFormStatus('original_title', '* Original Title is required');
			return;
		}
		if (!overview) {
			onSetFormStatus('overview', '* Overview is required');
			return;
		}
		if (isNaN(popularity)) {
			onSetFormStatus('popularity', '* Popularity is invalid');
			return;
		}
		if (!production_companies || production_companies.length <= 0) {
			onSetFormStatus('production_companies', '* At least one Production Company is required');
			return;
		}
		if (!release_date) {
			onSetFormStatus('release_date', '* Release Date is required');
			return;
		}
		if (!isValidDate(release_date)) {
			onSetFormStatus('release_date', '* Release Date is invalid');
			return;
		}
		if (isNaN(revenue)) {
			onSetFormStatus('revenue', '* Revenue is invalid');
			return;
		}
		if (isNaN(runtime)) {
			onSetFormStatus('runtime', '* Runtime Minutes is invalid');
			return;
		}
		if (!tagline) {
			onSetFormStatus('tagline', '* Tagline is required');
			return;
		}
		if (!title) {
			onSetFormStatus('title', '* Title is required');
			return;
		}
		if (isNaN(vote_average)) {
			onSetFormStatus('vote_average', '* Vote Average is invalid');
			return;
		}
		if (isNaN(vote_count)) {
			onSetFormStatus('vote_count', '* Vote Count is invalid');
			return;
		}
		if (!youtubeKey) {
			onSetFormStatus('youtubeKey', '* Youtube Key is required');
			return;
		}
		if (!actorsList || actorsList.length <= 0) {
			onSetFormStatus('actorsList', '* At least one Actor is required');
			return;
		}
		if (!crewsList || crewsList.length <= 0) {
			onSetFormStatus('crewsList', '* At least one Crew is required');
			return;
		}
		let boxDataErrorMessage = '';
		// Validate Actors.
		for (let i = 0, length = actorsList.length; i < length; i++) {
			const actor = actorsList[i];
			if (!actor.character) {
				updateActorError(actor.id, 'character');
				boxDataErrorMessage = '* Character is required';
				break;
			}
			if (!actor.name) {
				updateActorError(actor.id, 'name');
				boxDataErrorMessage = '* Full Name is required';
				break;
			}
			if (isNaN(actor.order)) {
				updateActorError(actor.id, 'order');
				boxDataErrorMessage = '* Order is invalid';
				return;
			}
			if (actorsList.findIndex(a => parseInt(a.id) !== parseInt(actor.id) && parseInt(a.order) === parseInt(actor.order)) > -1) {
				updateActorError(actor.id, 'order');
				boxDataErrorMessage = '* Order already exists';
				break;
			}
			if (isCreateMode) {
				if (!actor.profile_path) {
					updateActorError(actor.id, 'profile_path');
					boxDataErrorMessage = '* Profile Path is required';
					break;
				}
			}
		}
		if (boxDataErrorMessage) {
			onSetFormStatus('boxData', boxDataErrorMessage);
			return;
		}
		else {
			clearErrorActors();
		}
		// Validate Crews.
		for (let i = 0, length = crewsList.length; i < length; i++) {
			const crew = crewsList[i];
			if (!crew.department) {
				updateCrewError(crew.id, 'department');
				boxDataErrorMessage = '* Department is required';
				break;
			}
			if (!crew.job) {
				updateCrewError(crew.id, 'job');
				boxDataErrorMessage = '* Job is required';
				break;
			}
			if (!crew.name) {
				updateCrewError(crew.id, 'name');
				boxDataErrorMessage = '* Full Name is required';
				break;
			}

			if (isCreateMode) {
				if (!crew.profile_path) {
					updateCrewError(crew.id, 'profile_path');
					boxDataErrorMessage = '* Profile Path is required';
					break;
				}
			}
		}
		if (boxDataErrorMessage) {
			onSetFormStatus('boxData', boxDataErrorMessage);
			return;
		}
		else {
			clearErrorCrews();
		}
		// Validate Productions.
		for (let i = 0, length = production_companies.length; i < length; i++) {
			const productionCompany = production_companies[i];
			if (isCreateMode) {
				if (!productionCompany.logo_path) {
					updateProductionError(productionCompany.id, 'logo_path');
					boxDataErrorMessage = '* Logo Path is required';
					break;
				}
			}
			if (!productionCompany.name) {
				updateProductionError(productionCompany.id, 'name');
				boxDataErrorMessage = '* Full Name is required';
				break;
			}
		}
		if (boxDataErrorMessage) {
			onSetFormStatus('boxData', boxDataErrorMessage);
			return;
		}
		else {
			clearErrorProductions();
		}
		let result = null;
		if (isCreateMode) {
			result = await movieService.createMovie({
				adult, poster_path, budget, genres, homepage, imdb_id, original_language, original_title,
				overview, popularity, production_companies, production_countries, release_date, revenue,
				runtime, spoken_languages, status, tagline, title, video, vote_average, vote_count,
				youtubeKey, actorsList, crewsList
			});
		}
		else {
			const { clientDeleteActorIdsList, clientUpdateActorsList, clientAddActorsList, clientDeleteCrewIdsList,
				clientUpdateCrewsList, clientAddCrewsList, clientDeleteProductionIdsList, clientUpdateProductionsList,
				clientAddProductionsList } = setDataToUpdate();
			result = await movieService.updateMovie({
				movieId: id, adult, poster_path, budget, genres, homepage, imdb_id, original_language, original_title,
				overview, popularity, production_companies: [], production_countries, release_date, revenue,
				runtime, spoken_languages, status, tagline, title, video, vote_average, vote_count,
				youtubeKey, actorsList: [], crewsList: [], clientDeleteActorIdsList, clientUpdateActorsList, clientAddActorsList, clientDeleteCrewIdsList,
				clientUpdateCrewsList, clientAddCrewsList, clientDeleteProductionIdsList, clientUpdateProductionsList,
				clientAddProductionsList
			});
		}

		if (result.errorMessage) {
			onSetFormStatus('boxData', `* Error: ${result.errorMessage}`);
			return;
		}
		onSetFormStatus('', 'OK');
	};

	const genresItems = genresList.map(genre => {
		return (
			<Check
				key={genre.id}
				labelTitle={genre.name}
				checkName={genre.id}
				value={genres.findIndex(g => parseInt(g) === parseInt(genre.id)) > -1}
				onCheckChange={handleOnCheckChange}
			/>
		);
	});

	const renderActorsList = actorsList.filter(actor => !actor.isRemoved).map(actor => {
		return (
			<ActorBox
				key={actor.id}
				actor={actor}
				onActorBoxValueChange={handleOnActorBoxValueChange}
				onActorBoxRemoveClick={handleOnRemoveActorBoxButtonClick}
			/>
		);
	});

	const renderCrewsList = crewsList.filter(crew => !crew.isRemoved).map(crew => {
		return (
			<CrewBox
				key={crew.id}
				crew={crew}
				onCrewBoxValueChange={handleOnCrewBoxValueChange}
				onCrewBoxRemoveClick={handleOnRemoveCrewBoxButtonClick}
			/>
		);
	});

	const renderProductionsList = production_companies.filter(production => !production.isRemoved).map(production => {
		return (
			<ProductionBox
				key={production.id}
				production={production}
				countries={cultureService.getDropCountriesCode()}
				onProductionBoxValueChange={handleOnProductionBoxValueChange}
				onProductionBoxRemoveClick={handleOnRemoveProductionBoxButtonClick}
			/>
		);
	});

	return (
		<div className="wrapper">
			{isLoading && <PageLoader />}
			{!isLoading && <div>
				<PageTitle
					pageName="form"
					pageTitle="Add Movie"
				/>
				<div className="main-form">
					<div className="container">
						<Field
							labelTitle="Title"
							inputType="text"
							inputName="title"
							value={title}
							isError={errorFieldName === 'title'}
							onValueChange={handleOnValueChange}
						/>
						<Field
							labelTitle="Original Title"
							inputType="text"
							inputName="original_title"
							value={original_title}
							isError={errorFieldName === 'original_title'}
							onValueChange={handleOnValueChange}
						/>
						<Field
							labelTitle="Youtube Key"
							inputType="text"
							inputName="youtubeKey"
							value={youtubeKey}
							isError={errorFieldName === 'youtubeKey'}
							onValueChange={handleOnValueChange}
						/>
						<Field
							labelTitle="IMDB Id"
							inputType="text"
							inputName="imdb_id"
							value={imdb_id}
							isError={errorFieldName === 'imdb_id'}
							onValueChange={handleOnValueChange}
						/>
						<Field
							labelTitle="Poster Path"
							inputType="text"
							inputName="poster_path"
							value={poster_path}
							isError={errorFieldName === 'poster_path'}
							onValueChange={handleOnValueChange}
						/>
						<Field
							labelTitle="Budget"
							inputType="number"
							inputName="budget"
							value={budget}
							isError={errorFieldName === 'budget'}
							onValueChange={handleOnValueChange}
						/>
						<Dropdown
							labelTitle="Original Language"
							dropName="original_language"
							value={original_language[0]}
							dropOptions={cultureService.getDropLanguages()}
							onDropChange={handleOnSelectChange}
						/>
						<Boolean
							labelTitle="Is Adult Movie"
							boolName="adult"
							value={adult}
							onBoolChange={handleOnValueChange}
						/>
						<Boolean
							labelTitle="Has Videos"
							boolName="video"
							value={video}
							onBoolChange={handleOnValueChange}
						/>
						<LongText
							labelTitle="Tagline"
							longName="tagline"
							isError={errorFieldName === 'tagline'}
							value={tagline}
							onLongChange={handleOnValueChange}
						/>
					</div>
					<div className="container">
						<Field
							labelTitle="Popularity"
							inputType="number"
							inputName="popularity"
							value={popularity}
							isError={errorFieldName === 'popularity'}
							onValueChange={handleOnValueChange}
						/>
						<Field
							labelTitle="Revenue"
							inputType="number"
							inputName="revenue"
							value={revenue}
							isError={errorFieldName === 'revenue'}
							onValueChange={handleOnValueChange}
						/>
						<Field
							labelTitle="Runtime Minutes"
							inputType="number"
							inputName="runtime"
							value={runtime}
							isError={errorFieldName === 'runtime'}
							onValueChange={handleOnValueChange}
						/>
						<Field
							labelTitle="Vote Average"
							inputType="number"
							inputName="vote_average"
							value={vote_average}
							isError={errorFieldName === 'vote_average'}
							onValueChange={handleOnValueChange}
						/>
						<Field
							labelTitle="Vote Count"
							inputType="number"
							inputName="vote_count"
							value={vote_count}
							isError={errorFieldName === 'vote_count'}
							onValueChange={handleOnValueChange}
						/>
						<Field
							labelTitle="Homepage URL"
							inputType="text"
							inputName="homepage"
							value={homepage}
							isError={errorFieldName === 'homepage'}
							onValueChange={handleOnValueChange}
						/>
						<Dropdown
							labelTitle="Spoken Languages"
							dropName="spoken_languages"
							value={spoken_languages[0]}
							dropOptions={cultureService.getDropLanguages()}
							onDropChange={handleOnSelectChange}
						/>
						<Dropdown
							labelTitle="Status"
							dropName="status"
							value={status[0]}
							dropOptions={statuses}
							onDropChange={handleOnSelectChange}
						/>
						<Dropdown
							labelTitle="Production Country"
							dropName="production_countries"
							value={production_countries[0]}
							dropOptions={cultureService.getDropCountries()}
							onDropChange={handleOnSelectChange}
						/>
						<LongText
							labelTitle="Overview"
							longName="overview"
							isError={errorFieldName === 'overview'}
							value={overview}
							onLongChange={handleOnValueChange}
						/>
					</div>
				</div>
				<div className="date-picker">
					<DatePick
						labelTitle="Release Date"
						dateName="release_date"
						isError={errorFieldName === 'release_date'}
						value={release_date}
						onDateChange={handleOnDateChange}
					/>
				</div>
				<div className={`genres${errorFieldName === 'genres' ? ' error' : ''}`}>
					<div className="title">Genres</div>
					<div className="genresList">
						{genresItems}
					</div>
				</div>
				<div className="buttons">
					<MiniButton
						buttonText="Add Production"
						buttonTitle="Add Production"
						onClick={handleOnAddProductionBoxButtonClick}
					/>
					<MiniButton
						buttonText="Add Actor"
						buttonTitle="Add Actor"
						onClick={handleOnAddActorBoxButtonClick}
					/>
					<MiniButton
						buttonText="Add Crew"
						buttonTitle="Add Crew"
						onClick={handleOnAddCrewBoxButtonClick}
					/>
				</div>
				<div className="additional-data">
					{renderActorsList}
					{renderCrewsList}
					{renderProductionsList}
				</div>
				<div className="form-footer">
					<ButtonClick
						buttonText="Add"
						buttonTitle="Add"
						isLoading={false}
						onClick={submitForm}
					/>
					<div className={`status${errorFieldName ? '' : ' valid'}`}>
						{statusMessage}
					</div>
				</div>
			</div>}
		</div>
	);
};

Form.propTypes = propTypes;
Form.defaultProps = defaultProps;

export default Form;