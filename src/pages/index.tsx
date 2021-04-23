import { GetStaticProps } from 'next';
import Image from 'next/image';
import Link from 'next/link'
import { format, parseISO} from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { api } from '../services/api';
import { convertDurationToTimeString } from '../utils/convertDurationToTimeString';
import { useContext } from 'react';

import styles from './home.module.scss';
import { PlayerContext } from '../contexts/PlayerContext';

type Episodes = { 
  id: string;
  title: string;
  thumbnail: string;
  members: string;
  duration: number;
  durationAsString: string;
  publishedAt: string;
  url: string;

}

type HomeProps = {
  latestEpisodes: Episodes[];
  allEpisodes: Episodes[];

}


export default function Home({ latestEpisodes, allEpisodes }: HomeProps) {

  const { play } = useContext(PlayerContext);

  return (
    <div className={styles.homepage}>
      <section className={styles.latestEpisodes}>
        <h2>Últimos lançamentos</h2>

        <ul>
          {latestEpisodes.map(episodes => {
            return (
              <li key={episodes.id}>
                <div style={{ width: 100}}>
                  <Image 
                    width={192} 
                    height={192} 
                    src={episodes.thumbnail} 
                    alt={episodes.title}
                    objectFit="cover"
                  />
                </div>

                <div className={styles.episodesDetails}>
                  <Link href={`/episodes/${episodes.id}`}>
                    <a>{episodes.title}</a>
                  </Link>
                  <p>{episodes.members}</p>
                  <span>{episodes.publishedAt}</span>
                  <span>{episodes.durationAsString}</span>
                </div>

                <button type="button" onClick={()=>play(episodes)}>
                  <img src="/play-green.svg" alt="Tocar episódio"/>
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <section className={styles.allEpisodes}>
        <h2>Todos episódios</h2>

          <table cellSpacing={0}>
            <thead>
              <tr>
                <th></th>
                <th>Podcast</th>
                <th>Integrantes</th>
                <th>Data</th>
                <th>Duração</th>
                <th></th>
              </tr>
            </thead>
              <tbody>
                {allEpisodes.map(episodes =>{
                  return(
                    <tr key={episodes.id}>
                      <td style={{ width: 72}}>
                        <Image
                          width={120}
                          height={120}
                          src={episodes.thumbnail}  
                          alt = {episodes.title}
                          objectFit = "cover"
                        />
                      </td>
                      <td>
                        <Link href={`/episodes/${episodes.id}`}>
                          <a>{episodes.title}</a>
                        </Link>
                      </td>
                      <td>{episodes.members}</td>
                      <td style={{ width: 100}}>{episodes.publishedAt}</td>
                      <td>{episodes.durationAsString}</td>
                      <td>
                        <button type="button">
                          <img src="/play-green.svg" alt="Tocar episódio"/>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
          </table>

      </section>
    </div>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const { data } = await api.get('episodes', {
    params:{
      _limit: 12,
      _sort: 'published_at',
      _order: 'desc'
    }
  })
  
  const episodes = data.map(episodes =>{
    return{
      id: episodes.id,
      title: episodes.title,
      thumbnail: episodes.thumbnail,
      members: episodes.members,
      publishedAt: format(parseISO(episodes.published_at), 'd MMM yy', { locale: ptBR }),
      duration: Number(episodes.file.duration),
      durationAsString: convertDurationToTimeString(Number(episodes.file.duration)),
      url: episodes.file.url,
    };
  })

  const latestEpisodes = episodes.slice(0,2);
  const allEpisodes = episodes.slice(2, episodes.length);


  return{
    props:{
      latestEpisodes,
      allEpisodes,
    },
    revalidate: 60 *60 *8,
  }
}