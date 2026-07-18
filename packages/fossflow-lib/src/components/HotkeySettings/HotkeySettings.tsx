import React from 'react';
import {
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { useUiStateStore } from 'src/stores/uiStateStore';
import { HOTKEY_PROFILES, HotkeyProfile } from 'src/config/hotkeys';

export const HotkeySettings = () => {
  const hotkeyProfile = useUiStateStore((state) => state.hotkeyProfile);
  const setHotkeyProfile = useUiStateStore((state) => state.actions.setHotkeyProfile);

  const currentMapping = HOTKEY_PROFILES[hotkeyProfile];

  const tools = [
    { name: 'Selectionner', key: currentMapping.select },
    { name: 'Deplacer la vue', key: currentMapping.pan },
    { name: 'Ajouter un element', key: currentMapping.addItem },
    { name: 'Rectangle', key: currentMapping.rectangle },
    { name: 'Connecteur', key: currentMapping.connector },
    { name: 'Texte', key: currentMapping.text }
  ];

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Parametres des raccourcis
      </Typography>
      
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Profil de raccourcis</InputLabel>
        <Select
          value={hotkeyProfile}
          label="Profil de raccourcis"
          onChange={(e) => setHotkeyProfile(e.target.value as HotkeyProfile)}
        >
          <MenuItem value="qwerty">QWERTY (Q, W, E, R, T, Y)</MenuItem>
          <MenuItem value="smnrct">SMNRCT (S, M, N, R, C, T)</MenuItem>
          <MenuItem value="none">Aucun raccourci</MenuItem>
        </Select>
      </FormControl>

      {hotkeyProfile !== 'none' && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Outil</TableCell>
                <TableCell>Raccourci</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tools.map((tool) => (
                <TableRow key={tool.name}>
                  <TableCell>{tool.name}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {tool.key ? tool.key.toUpperCase() : '-'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
        Note : les raccourcis fonctionnent lorsque vous n'etes pas en train d'ecrire dans un champ
      </Typography>
    </Box>
  );
};
