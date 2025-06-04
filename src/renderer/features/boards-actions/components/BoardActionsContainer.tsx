import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useConnectedBoards } from "../hooks/useConnectedBoards";
import { useFormatBoards } from "../hooks/useFormatBoard";
import { ConfirmActionButton } from "@/components/composite/confirm-action-button";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { BAUD_RATES } from "../../../../main/common/constants";

export default function BoardActionsContainer() {
  const { toast } = useToast();

  const [selectedBoardPath, setSelectedBoardPath] = useState<string | null>(
    null
  );

  const [selectedBaudRate, setSelectedBaudRate] = useState(BAUD_RATES[0]);

  const [boardError, setBoardError] = useState(false);
  const { boards } = useConnectedBoards();
  const { formatBoard, isLoading: isFormattingBoard } = useFormatBoards({
    onError: () =>
      toast({ title: "Failed to format the board.", variant: "destructive" }),
    onSuccess: () => toast({ title: "Board formatted successfully." }),
  });

  useEffect(() => {
    if (selectedBaudRate && selectedBoardPath) {
      window.api.connectToBoard(selectedBoardPath, selectedBaudRate);
    }
  }, [selectedBaudRate, selectedBoardPath]);

  const executingProcess = Boolean(isFormattingBoard);

  const selectBoardClasses = cn(
    "w-full",
    boardError && "border-red-500 focus:ring-red-500"
  );

  return (
    <>
      <div className="mb-2">
        <Label htmlFor="board">Board</Label>
        <Select
          name="board"
          disabled={executingProcess}
          onValueChange={(boardPath) => {
            setBoardError(false);
            setSelectedBoardPath(boardPath);
          }}
        >
          <SelectTrigger className={selectBoardClasses}>
            <SelectValue placeholder="Choose board" />
          </SelectTrigger>
          <SelectContent>
            {boards.map((b) => (
              <SelectItem
                key={`board-choice-item-${b.path}`}
                value={b.path as string}
              >
                {b.path}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="mb-2">
        <Label htmlFor="baud">Baud Rate</Label>
        <Select
          name="baud"
          defaultValue={String(selectedBaudRate)}
          disabled={executingProcess}
          onValueChange={(baudRate) => {
            setSelectedBaudRate(parseInt(baudRate, 10));
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose baud rate" />
          </SelectTrigger>
          <SelectContent>
            {BAUD_RATES.map((b) => (
              <SelectItem key={`baudrate-choice-item-${b}`} value={String(b)}>
                {b}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Tabs defaultValue="upload" className="justify-center">
        <TabsList className="w-full">
          <TabsTrigger
            className="flex-1"
            value="upload"
            disabled={executingProcess}
          >
            Upload
          </TabsTrigger>
          <TabsTrigger
            className="flex-1"
            value="flash"
            disabled={executingProcess}
          >
            Flash
          </TabsTrigger>
          <TabsTrigger
            className="flex-1"
            value="format"
            disabled={executingProcess}
          >
            Format
          </TabsTrigger>
        </TabsList>
        <TabsContent value="upload">Upload</TabsContent>
        <TabsContent value="flash">Flash</TabsContent>
        <TabsContent value="format" className="w-full flex justify-center mt-2">
          <ConfirmActionButton
            disabled={isFormattingBoard}
            openerLabel={
              isFormattingBoard ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Formatting...
                </>
              ) : (
                "Format Board"
              )
            }
            confirmationLabel="Are you sure you want to format the connected board?"
            onConfirm={() => {
              if (!selectedBoardPath) {
                toast({
                  title: "No board is selected.",
                  variant: "destructive",
                });
                return setBoardError(true);
              }

              formatBoard(selectedBoardPath);
            }}
          />
        </TabsContent>
      </Tabs>
    </>
  );
}
