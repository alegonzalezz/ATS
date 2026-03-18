import * as React from "react";
import { Check, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
import { toast } from "sonner";

interface SkillsSelectorProps {
  selectedSkills: string[];
  onSkillsChange: (skills: string[]) => void;
  availableSkills: string[];
  onCreateSkill?: (name: string) => Promise<{ id: string; name: string }>;
  className?: string;
}

export function SkillsSelector({ selectedSkills, onSkillsChange, availableSkills, onCreateSkill, className }: SkillsSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filteredSkills, setFilteredSkills] = React.useState<string[]>([]);

  // Update filtered skills when search query or available skills change
  React.useEffect(() => {
    // Filter out skills that are already selected
    const available = availableSkills.filter(skill => !selectedSkills.includes(skill));
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const filtered = available.filter(skill => 
        skill.toLowerCase().includes(query)
      );
      setFilteredSkills(filtered);
    } else {
      setFilteredSkills(available);
    }
  }, [searchQuery, availableSkills, selectedSkills]);

  const handleSelectSkill = (skillName: string) => {
    if (selectedSkills.includes(skillName)) {
      // Remove skill
      onSkillsChange(selectedSkills.filter(s => s !== skillName));
    } else {
      // Add skill
      onSkillsChange([...selectedSkills, skillName]);
      // Reset search and close popover
      setSearchQuery("");
      setOpen(false);
    }
  };

  const handleCreateSkill = async () => {
    if (!searchQuery.trim() || !onCreateSkill) return;

    try {
      const newSkill = await onCreateSkill(searchQuery);
      onSkillsChange([...selectedSkills, newSkill.name]);
      setSearchQuery("");
      toast.success(`Habilidad "${newSkill.name}" creada`);
    } catch (error: unknown) {
      if (error instanceof Error && error.message?.includes("already exists")) {
        toast.error("La habilidad ya existe");
      } else {
        toast.error("Error al crear la habilidad");
      }
    }
  };

  const removeSkill = (skillName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onSkillsChange(selectedSkills.filter(s => s !== skillName));
  };

  return (
    <div className={cn("w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto min-h-[42px] py-2"
          >
            <div className="flex flex-wrap gap-1">
              {selectedSkills.length > 0 ? (
                selectedSkills.map(skill => (
                  <Badge key={skill} variant="secondary" className="mr-1">
                    {skill}
                    <button
                      onClick={(e) => removeSkill(skill, e)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))
              ) : (
                <span className="text-muted-foreground">Seleccionar habilidades...</span>
              )}
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Buscar o crear habilidad..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              <CommandEmpty>
                {searchQuery.trim() ? (
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={handleCreateSkill}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Crear "{searchQuery}"
                  </Button>
                ) : (
                  <span className="text-muted-foreground">No hay habilidades</span>
                )}
              </CommandEmpty>
              <CommandGroup heading="Habilidades disponibles">
                {filteredSkills.map(skill => (
                  <CommandItem
                    key={skill}
                    value={skill}
                    onSelect={() => handleSelectSkill(skill)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedSkills.includes(skill) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {skill}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
