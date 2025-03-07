"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, MoreHorizontal, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { createClient, Session } from "@supabase/supabase-js";
import { Skeleton } from "@/components/ui/skeleton";

interface Room {
  id: number;
  name: string;
  type: string;
  price: number;
  image_url?: string;
}

interface NewRoom {
  name: string;
  type: string;
  price: number;
}

const INITIAL_ROOM_STATE: NewRoom = {
  name: "",
  type: "",
  price: 0,
};

const ROOM_TYPES = [
  { value: "jednolůžkový", label: "Jednolůžkový" },
  { value: "dvoulůžkový", label: "Dvoulůžkový" },
  { value: "apartmá", label: "Apartmá" },
];

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);

type ErrorType = {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
};

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [newRoom, setNewRoom] = useState<NewRoom>(INITIAL_ROOM_STATE);
  const [session, setSession] = useState<Session | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const setupAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      });

      return () => subscription.unsubscribe();
    };

    setupAuth();
  }, []);

  const fetchRooms = useCallback(async () => {
    if (!session) {
      console.log("No session available");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .order("id", { ascending: true });

      if (error) throw error;
      setRooms(data || []);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handleAddRoom = async () => {
    if (!session) {
      alert("Chcete-li přidat místnosti, přihlaste se");
      return;
    }

    if (!newRoom.name || !newRoom.type || !newRoom.price) {
      alert("Vyplňte prosím všechna pole");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("rooms")
        .insert([newRoom])
        .select();

      if (error) throw error;

      if (data) {
        setRooms((prev) => [...prev, ...data]);
        setIsDialogOpen(false);
        setNewRoom(INITIAL_ROOM_STATE);
      }
    } catch (error) {
      const typedError = error as ErrorType;
      console.error("Chyba při přidávání místnosti:", typedError);
      alert(
        `Chyba při přidávání místnosti: ${
          typedError.message || "Neznámá chyba"
        }`
      );
    }
  };

  const handleDeleteRoom = async () => {
    if (!session || !roomToDelete) return;

    try {
      const { error } = await supabase
        .from("rooms")
        .delete()
        .eq("id", roomToDelete.id);

      if (error) throw error;

      setRooms((prev) => prev.filter((room) => room.id !== roomToDelete.id));
      setRoomToDelete(null);
    } catch (error) {
      const typedError = error as ErrorType;
      console.error("Chyba při mazání místnosti:", typedError);
      alert(`Chyba při mazání místnosti: ${typedError.message}`);
    }
  };

  const handleInputChange = (field: keyof NewRoom, value: string | number) => {
    setNewRoom((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-40 bg-muted animate-pulse rounded-md" />
        <div className="border rounded-lg p-6">
          <div className="h-8 w-full bg-muted animate-pulse rounded-md mb-4" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-12 w-full bg-muted animate-pulse rounded-md"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Přidat místnost
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Přidat novou místnost</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Název místnosti</Label>
              <Input
                id="name"
                value={newRoom.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Typ pokoje</Label>
              <Select
                value={newRoom.type}
                onValueChange={(value) => handleInputChange("type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Vyberte typ pokoje" />
                </SelectTrigger>
                <SelectContent>
                  {ROOM_TYPES.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Cena</Label>
              <Input
                id="price"
                type="number"
                min="0"
                value={newRoom.price}
                onChange={(e) =>
                  handleInputChange("price", Number(e.target.value))
                }
              />
            </div>
            <Button onClick={handleAddRoom} className="w-full">
              Přidat místnost
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Název místnosti</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead>Cena</TableHead>
                <TableHead className="w-[100px]">Akce</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <TableRow key={`skeleton-${i}`}>
                        <TableCell>
                          <Skeleton className="h-5 w-40" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-28" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-8 w-8 rounded-full" />
                        </TableCell>
                      </TableRow>
                    ))
                : rooms.map((room) => (
                    <TableRow key={room.id}>
                      <TableCell>{room.name}</TableCell>
                      <TableCell>{room.type}</TableCell>
                      <TableCell>{room.price}Kč</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                router.push(
                                  `/dashboard/pokoje/${encodeURIComponent(
                                    room.name
                                  )}/edit?id=${room.id}`
                                );
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Upravit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => {
                                setRoomToDelete(room);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Vymazat
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog
        open={!!roomToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setRoomToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Jste si naprosto jistý?</AlertDialogTitle>
            <AlertDialogDescription>
              Tuto akci nelze vrátit zpět. Tím se trvale smaže místnost a
              všechna související data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRoomToDelete(null)}>
              Zrušit
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDeleteRoom}
            >
              Smazat
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
