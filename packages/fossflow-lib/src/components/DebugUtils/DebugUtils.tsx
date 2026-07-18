import React from 'react';
import { Box } from '@mui/material';
import { useUiStateStore } from 'src/stores/uiStateStore';
import { useResizeObserver } from 'src/hooks/useResizeObserver';
import { useScene } from 'src/hooks/useScene';
import { LineItem } from './LineItem';

export const DebugUtils = () => {
  const uiState = useUiStateStore(
    ({ scroll, mouse, zoom, mode, rendererEl }) => {
      return { scroll, mouse, zoom, mode, rendererEl };
    }
  );
  const scene = useScene();
  const { size: rendererSize } = useResizeObserver(uiState.rendererEl);

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        bgcolor: 'common.white',
        px: 2,
        py: 1
      }}
    >
      <LineItem
        title="Souris"
        value={`${uiState.mouse.position.tile.x}, ${uiState.mouse.position.tile.y}`}
      />
      <LineItem
        title="Clic souris"
        value={
          uiState.mouse.mousedown
            ? `${uiState.mouse.mousedown.tile.x}, ${uiState.mouse.mousedown.tile.y}`
            : 'nul'
        }
      />
      <LineItem
        title="Delta souris"
        value={
          uiState.mouse.delta
            ? `${uiState.mouse.delta.tile.x}, ${uiState.mouse.delta.tile.y}`
            : 'nul'
        }
      />
      <LineItem
        title="Defilement"
        value={`${uiState.scroll.position.x}, ${uiState.scroll.position.y}`}
      />
      <LineItem title="Zoom" value={uiState.zoom} />
      <LineItem
        title="Taille"
        value={`${rendererSize.width}, ${rendererSize.height}`}
      />
      <LineItem
        title="Infos scene"
        value={`${scene.items.length} elements dans la scene`}
      />
      <LineItem title="Mode" value={uiState.mode.type} />
      <LineItem
        title="Donnees du mode"
        value={JSON.stringify(uiState.mode, null, 2)}
      />
    </Box>
  );
};
