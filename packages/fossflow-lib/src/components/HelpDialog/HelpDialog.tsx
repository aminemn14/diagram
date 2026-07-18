import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Divider
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useUiStateStore } from 'src/stores/uiStateStore';
import { DialogTypeEnum } from 'src/types/ui';

interface ShortcutItem {
  action: string;
  shortcut: string;
  description: string;
}

const keyboardShortcuts: ShortcutItem[] = [
  {
    action: 'Annuler',
    shortcut: 'Ctrl+Z',
    description: 'Annuler la derniere action'
  },
  {
    action: 'Retablir',
    shortcut: 'Ctrl+Y',
    description: 'Retablir la derniere action annulee'
  },
  {
    action: 'Retablir (alternative)',
    shortcut: 'Ctrl+Shift+Z',
    description: 'Raccourci alternatif pour retablir'
  },
  {
    action: 'Aide',
    shortcut: 'F1',
    description: "Ouvrir l'aide avec les raccourcis clavier"
  },
  {
    action: 'Zoom avant',
    shortcut: 'Molette vers le haut',
    description: 'Zoomer sur le canevas'
  },
  {
    action: 'Zoom arriere',
    shortcut: 'Molette vers le bas',
    description: 'Dezoomer sur le canevas'
  },
  {
    action: 'Deplacer le canevas',
    shortcut: 'Clic gauche + glisser',
    description: 'Deplacer le canevas en mode deplacement'
  },
  {
    action: 'Menu contextuel',
    shortcut: 'Clic droit',
    description: 'Ouvrir le menu contextuel sur les elements ou sur un espace vide'
  }
];

const mouseInteractions: ShortcutItem[] = [
  {
    action: 'Outil de selection',
    shortcut: 'Cliquer sur Selectionner',
    description: 'Passer en mode selection'
  },
  {
    action: 'Outil de deplacement',
    shortcut: 'Cliquer sur Deplacer la vue',
    description: 'Passer en mode deplacement du canevas'
  },
  {
    action: 'Ajouter un element',
    shortcut: 'Cliquer sur Ajouter un element',
    description: "Ouvrir le selecteur d'icones pour ajouter de nouveaux elements"
  },
  {
    action: 'Dessiner un rectangle',
    shortcut: 'Cliquer sur Rectangle',
    description: 'Passer en mode dessin de rectangle'
  },
  {
    action: 'Creer un connecteur',
    shortcut: 'Cliquer sur Connecteur',
    description: 'Passer en mode connecteur'
  },
  {
    action: 'Ajouter du texte',
    shortcut: 'Cliquer sur Texte',
    description: 'Creer une nouvelle zone de texte'
  }
];

export const HelpDialog = () => {
  const dialog = useUiStateStore((state) => {
    return state.dialog;
  });
  const setDialog = useUiStateStore((state) => {
    return state.actions.setDialog;
  });

  const isOpen = dialog === DialogTypeEnum.HELP;

  const handleClose = () => {
    setDialog(null);
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '60vh'
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" component="div">
            Raccourcis clavier et aide
          </Typography>
          <Button
            onClick={handleClose}
            sx={{
              minWidth: 'auto',
              p: 1,
              bgcolor: 'transparent',
              boxShadow: 'none',
              '&:hover': { bgcolor: 'transparent' },
              '&:focus': { bgcolor: 'transparent' },
              '&:active': { bgcolor: 'transparent' }
            }}
          >
            <CloseIcon />
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Raccourcis clavier
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Raccourci</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {keyboardShortcuts.map((shortcut, index) => {
                  return (
                    <TableRow key={index}>
                      <TableCell>{shortcut.action}</TableCell>
                      <TableCell>
                        <code
                          style={{
                            backgroundColor: '#f5f5f5',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontFamily: 'monospace'
                          }}
                        >
                          {shortcut.shortcut}
                        </code>
                      </TableCell>
                      <TableCell>{shortcut.description}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box>
          <Typography variant="h6" gutterBottom>
            Interactions souris
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Methode</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mouseInteractions.map((interaction, index) => {
                  return (
                    <TableRow key={index}>
                      <TableCell>{interaction.action}</TableCell>
                      <TableCell>
                        <code
                          style={{
                            backgroundColor: '#f5f5f5',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontFamily: 'monospace'
                          }}
                        >
                          {interaction.shortcut}
                        </code>
                      </TableCell>
                      <TableCell>{interaction.description}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
          <Typography variant="body2" color="info.contrastText">
            <strong>Note :</strong> les raccourcis clavier sont desactives lors de la saisie
            dans les champs, zones de texte ou elements modifiables afin d'eviter
            les conflits.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} variant="contained">
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
};
