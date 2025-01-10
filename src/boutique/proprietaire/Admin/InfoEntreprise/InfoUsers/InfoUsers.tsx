import { Avatar, Chip, Grid, ListItem, ListItemAvatar, ListItemText, Typography } from '@mui/material';
import MainCard from '../../../../../components/MainCard';
import { stringAvatar } from '../../../../../usePerso/fonctionPerso';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import React from 'react';
import { connect } from '../../../../../_services/account.service';
import { useGetEntrepriseUsers, useRemoveUserEntreprise } from '../../../../../usePerso/fonction.user';
import { useStoreUuid } from '../../../../../usePerso/store';

export default function InfoUsers() {
    const uuid = useStoreUuid((state) => state.selectedId)
    const {entrepriseUsers} = useGetEntrepriseUsers(uuid!)

    console.log(entrepriseUsers)

    const {removeEntreprise} = useRemoveUserEntreprise()

    const handleDelete = (post: any) => {
        const top = {
          entreprise_id: uuid,
          user_id: post,
          admin_id: connect,
        }
        removeEntreprise(top);
        console.info('delete.', top);
      };
    
  return <>
  <Grid container rowSpacing={4.5} columnSpacing={2.75}>
    <Grid item xs={12} md={5} lg={4}>
        <Grid container alignItems="center" justifyContent="space-between">
        <Grid item>
            <Typography variant="h5">Les utilisateurs de cette entreprise</Typography>
        </Grid>
        <Grid item />
        </Grid>
        {entrepriseUsers && entrepriseUsers.map((post, index) => {
        const handleDeleted = () => {
            const confirmation = window.confirm("Vous êtes sûr de vouloir supprimer cet utilisateur de cet entreprise ?");
            if (confirmation) {
            // Appel de la fonction de suppression
            handleDelete(post.uuid)
            }
        };
        return <MainCard sx={{ mb: 1 }} content={false}>
            
            <ListItem key={index} alignItems="flex-start">
                <ListItemAvatar>
                
                <Avatar {...stringAvatar(`${post.last_name} ${post.first_name}`)} />
                </ListItemAvatar>
                <ListItemText
                primary={post.username}
                secondary={
                    <React.Fragment>
                    <Typography
                        sx={{ display: 'inline' }}
                        component="span"
                        variant="body2"
                        color="text.primary"
                    >
                        {post.last_name} {post.first_name}
                    </Typography>
                    {post.uuid === connect ? 
                        <Chip
                        label="admin"
                        variant="outlined"
                        color="success"
                        className='mx-5'
                        />
                        :
                        <Chip
                        // label="delete"
                        // onClick={handleClick}
                        onDelete={handleDeleted}
                        deleteIcon={<DeleteIcon />}
                        variant="outlined"
                        color="error"
                        className='mx-5'
                        />
                    }
                    </React.Fragment>
                }
                />
            </ListItem>
        </MainCard>
        })}
    </Grid>
  </Grid>
  </>
}
