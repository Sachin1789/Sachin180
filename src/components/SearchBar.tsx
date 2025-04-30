
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onAddNew: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onAddNew }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by name, email, or course..."
          className="pl-8"
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>
      <Button onClick={onAddNew}>
        <Plus className="h-4 w-4 mr-2" /> Add Student
      </Button>
    </div>
  );
};

export default SearchBar;
