import { Box, Typography } from '@mui/material';
import { useGetUserEntreprises } from '../../usePerso/fonction.user';
import { connect } from '../../_services/account.service';
import { BASE } from '../../_services/caller.service';
import { Link } from 'react-router-dom';
import Nav from '../../_components/Button/Nav';

export default function EseSortie() {
    const {userEntreprises, isLoading, isError} = useGetUserEntreprises(connect)

    if (isLoading) {
    return <div>Loading...</div>
    }

    if (isError) {
    return <div>Error</div>
    }

    if(userEntreprises){

    return <>
        <Nav />
        <Typography variant="h5" className='mb-2'>
        Choisisez l'entreprise qui doit effectuer la vente
        </Typography>
        {userEntreprises && userEntreprises?.map((post: any, index)=> {
        let url = BASE(post.image)
        return <div key={index} className="w-full md:w-1/4 sm:w-1/2 px-2 mb-4">
            <Link to={`/sortie/entreprise/${post.uuid}`} className="m-1 block"> 
            <Box className="flex items-center p-4 bg-white shadow-md rounded-lg dark:bg-gray-800">
                {/* Remplacer l'icône par une image */}
                <Box className="flex items-center justify-center w-12 h-12 bg-blue-500 rounded-full overflow-hidden">
                <img
                    src={url} // Remplacez par le lien de votre image
                    alt="Icon"
                    className="object-cover w-full h-full"
                />
                </Box>
                <Box className="ml-4">
                <Typography variant="body2" className="text-gray-500 dark:text-gray-300">
                    {post.nom}
                </Typography>
                <Typography variant="h6" className="font-semibold text-gray-900 dark:text-white">
                    {post.adresse}
                </Typography>
                </Box>
            </Box>
            </Link>
        </div>
        })}
    </>
    }

}
