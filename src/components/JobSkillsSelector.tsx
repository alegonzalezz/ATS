import * as React from "react";
import { Check, Plus, X, Star, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Skill } from "@/types";

interface JobSkillsSelectorProps {
  requiredSkills: Skill[];
  preferredSkills: Skill[];
  availableSkills: Skill[];
  onRequiredChange: (skills: Skill[]) => void;
  onPreferredChange: (skills: Skill[]) => void;
  className?: string;
}

export function JobSkillsSelector({
  requiredSkills,
  preferredSkills,
  availableSkills,
  onRequiredChange,
  onPreferredChange,
  className,
}: JobSkillsSelectorProps) {
  const [requiredOpen, setRequiredOpen] = React.useState(false);
  const [preferredOpen, setPreferredOpen] = React.useState(false);
  const [requiredSearch, setRequiredSearch] = React.useState("");
  const [preferredSearch, setPreferredSearch] = React.useState("");

  const requiredSkillIds = React.useMemo(
    () => new Set(requiredSkills.map((s) => s.id)),
    [requiredSkills]
  );
  const preferredSkillIds = React.useMemo(
    () => new Set(preferredSkills.map((s) => s.id)),
    [preferredSkills]
  );

  const getAvailableForRequired = React.useMemo(() => {
    return availableSkills.filter(
      (s) => !requiredSkillIds.has(s.id) && !preferredSkillIds.has(s.id)
    );
  }, [availableSkills, requiredSkillIds, preferredSkillIds]);

  const getAvailableForPreferred = React.useMemo(() => {
    return availableSkills.filter(
      (s) => !requiredSkillIds.has(s.id) && !preferredSkillIds.has(s.id)
    );
  }, [availableSkills, requiredSkillIds, preferredSkillIds]);

  const filteredRequiredSkills = React.useMemo(() => {
    if (!requiredSearch.trim()) return getAvailableForRequired;
    const query = requiredSearch.toLowerCase();
    return getAvailableForRequired.filter((s) =>
      s.name.toLowerCase().includes(query)
    );
  }, [getAvailableForRequired, requiredSearch]);

  const filteredPreferredSkills = React.useMemo(() => {
    if (!preferredSearch.trim()) return getAvailableForPreferred;
    const query = preferredSearch.toLowerCase();
    return getAvailableForPreferred.filter((s) =>
      s.name.toLowerCase().includes(query)
    );
  }, [getAvailableForPreferred, preferredSearch]);

  const handleSelectRequired = (skill: Skill) => {
    onRequiredChange([...requiredSkills, skill]);
    setRequiredSearch("");
    setRequiredOpen(false);
  };

  const handleSelectPreferred = (skill: Skill) => {
    onPreferredChange([...preferredSkills, skill]);
    setPreferredSearch("");
    setPreferredOpen(false);
  };

  const removeRequiredSkill = (skillId: string) => {
    onRequiredChange(requiredSkills.filter((s) => s.id !== skillId));
  };

  const removePreferredSkill = (skillId: string) => {
    onPreferredChange(preferredSkills.filter((s) => s.id !== skillId));
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Star className="h-4 w-4 text-amber-500" />
          Skills Requeridos
          <span className="text-xs text-muted-foreground font-normal">
            (obligatorios)
          </span>
        </Label>
        <SkillSelect
          open={requiredOpen}
          onOpenChange={setRequiredOpen}
          searchQuery={requiredSearch}
          onSearchChange={setRequiredSearch}
          filteredSkills={filteredRequiredSkills}
          selectedSkills={requiredSkills}
          onSelect={handleSelectRequired}
          onRemove={removeRequiredSkill}
          placeholder="Buscar skills requeridos..."
          emptyMessage="No hay skills disponibles"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-500" />
          Skills Preferidos
          <span className="text-xs text-muted-foreground font-normal">
            (deseables)
          </span>
        </Label>
        <SkillSelect
          open={preferredOpen}
          onOpenChange={setPreferredOpen}
          searchQuery={preferredSearch}
          onSearchChange={setPreferredSearch}
          filteredSkills={filteredPreferredSkills}
          selectedSkills={preferredSkills}
          onSelect={handleSelectPreferred}
          onRemove={removePreferredSkill}
          placeholder="Buscar skills preferidos..."
          emptyMessage="No hay skills disponibles"
        />
      </div>
    </div>
  );
}

interface SkillSelectProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filteredSkills: Skill[];
  selectedSkills: Skill[];
  onSelect: (skill: Skill) => void;
  onRemove: (skillId: string) => void;
  placeholder: string;
  emptyMessage: string;
}

function SkillSelect({
  open,
  onOpenChange,
  searchQuery,
  onSearchChange,
  filteredSkills,
  selectedSkills,
  onSelect,
  onRemove,
  placeholder,
  emptyMessage,
}: SkillSelectProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto min-h-[42px] py-2"
        >
          <div className="flex flex-wrap gap-1">
            {selectedSkills.length > 0 ? (
              selectedSkills.map((skill) => (
                <Badge
                  key={skill.id}
                  variant="secondary"
                  className="mr-1 bg-amber-100 text-amber-800 hover:bg-amber-200"
                >
                  {skill.name}
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(skill.id);
                    }}
                    className="ml-1 hover:text-red-500 cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </span>
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder={placeholder}
            value={searchQuery}
            onValueChange={onSearchChange}
          />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {filteredSkills.map((skill) => (
                <CommandItem
                  key={skill.id}
                  value={skill.name}
                  onSelect={() => onSelect(skill)}
                >
                  <Check className="mr-2 h-4 w-4" />
                  {skill.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
