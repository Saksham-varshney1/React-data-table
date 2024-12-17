import { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Panel } from 'primereact/panel';
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import './App.css';
import { Artwork, ArtworkResponse } from './types';

function App() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedArtworks, setSelectedArtworks] = useState<Artwork[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const loadArtworks = async (page: number) => {
    setLoading(true);
    try {
      const response = await fetch(`https://api.artic.edu/api/v1/artworks?page=${page}`);
      const data: ArtworkResponse = await response.json();
      setArtworks(data.data);
      setTotalRecords(data.pagination.total);
    } catch (error) {
      console.error('Error fetching artworks:', error);
    } finally {
      setLoading(false);
    }
  };

  const onPage = (event: { first: number; rows: number }) => {
    const page = Math.floor(event.first / event.rows) + 1;
    loadArtworks(page);
  };

  const onSelectionChange = (e: { value: Artwork[] }) => {
    const newSelection = e.value;
    setSelectedArtworks(newSelection);
    
    // Update the persistent selection set
    const newSelectedIds = new Set(selectedIds);
    artworks.forEach(artwork => {
      const isCurrentlySelected = newSelection.some(selected => selected.id === artwork.id);
      if (isCurrentlySelected) {
        newSelectedIds.add(artwork.id);
      } else {
        newSelectedIds.delete(artwork.id);
      }
    });
    setSelectedIds(newSelectedIds);
  };

  useEffect(() => {
    loadArtworks(1);
  }, []);

  // Update selection when artworks change (page change)
  useEffect(() => {
    const newSelectedArtworks = artworks.filter(artwork => selectedIds.has(artwork.id));
    setSelectedArtworks(newSelectedArtworks);
  }, [artworks, selectedIds]);

  return (
    <div className="card">
      {selectedArtworks.length > 0 && (
        <Panel className="mb-3" header="Selected Artworks">
          <div className="selected-rows">
            <p>Selected Rows: {selectedIds.size}</p>
            <input 
              type="text" 
              placeholder="Select rows..." 
              value={selectedArtworks.map(art => art.title).join(', ')} 
              readOnly 
            />
            <button className="submit-btn">Submit</button>
          </div>
        </Panel>
      )}

      <DataTable
        value={artworks}
        lazy
        dataKey="id"
        paginator
        rows={12}
        totalRecords={totalRecords}
        loading={loading}
        onPage={onPage}
        selection={selectedArtworks}
        onSelectionChange={onSelectionChange}
        selectionMode="multiple"
        className="p-datatable-striped"
      >
        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
        <Column field="title" header="Title" sortable />
        <Column field="place_of_origin" header="Place of Origin" sortable />
        <Column field="artist_display" header="Artist" sortable />
        <Column field="inscriptions" header="Inscriptions" sortable />
        <Column field="date_start" header="Start Date" sortable />
        <Column field="date_end" header="End Date" sortable />
      </DataTable>
    </div>
  );
}

export default App;