import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useClientStore } from '@/stores/clientStore'
import { Plus, Pencil, Trash2, User, Phone, CircleDollarSign, Gem, ChevronLeft, ChevronRight } from 'lucide-react'

export function ClientBlock() {
  const { i18n } = useTranslation()
  const isUrdu = i18n.language === 'ur'
  const { selectedClient, searchQuery, searchResults, searchClients, selectClient, addClient, updateClient, deleteClient, setSearchQuery, navigateClient } = useClientStore()
  const [editMode, setEditMode] = useState(false)
  const [naam, setNaam] = useState('')
  const [phone, setPhone] = useState('')
  const [showAdd, setShowAdd] = useState(false)

  useEffect(() => {
    if (selectedClient && editMode) {
      setNaam(selectedClient.naam)
      setPhone(selectedClient.phone)
    }
  }, [selectedClient, editMode])

  const handleSelect = (client: NonNullable<typeof selectedClient>) => {
    selectClient(client)
    setSearchQuery(client.naam)
    setEditMode(false)
  }

  const handleAdd = async () => {
    if (!naam.trim()) return
    const client = await addClient(naam.trim(), phone.trim())
    handleSelect(client)
    setShowAdd(false)
    setNaam('')
    setPhone('')
  }

  const handleUpdate = async () => {
    if (!selectedClient?.id || !naam.trim()) return
    await updateClient(selectedClient.id, { naam: naam.trim(), phone: phone.trim() })
    setEditMode(false)
  }

  const handleDelete = async () => {
    if (!selectedClient?.id) return
    await deleteClient(selectedClient.id)
    setSearchQuery('')
  }

  return (
    <Card className="border-amber-200 dark:border-zinc-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-amber-800 dark:text-amber-400 flex items-center justify-between">
          <span>{isUrdu ? 'گاہک' : 'Customer'}</span>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowAdd(!showAdd)}>
              <Plus className="h-4 w-4" />
            </Button>
            {selectedClient && (
              <>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditMode(!editMode)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 dark:text-red-400" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="relative">
          <Input
            className="h-8 text-sm pl-8"
            placeholder={isUrdu ? 'نام یا فون نمبر سے تلاش...' : 'Search by name or phone...'}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              searchClients(e.target.value)
            }}
            dir="auto"
          />
          <User className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          {searchResults.length > 0 && !selectedClient && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg z-50 max-h-32 overflow-y-auto">
              {searchResults.map((c) => (
                <button
                  key={c.id}
                  className="w-full text-left px-3 py-1.5 text-sm hover:bg-accent"
                  onClick={() => handleSelect(c)}
                >
                  [{c.code}] {c.naam} — {c.phone}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 h-8" onClick={() => navigateClient('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="flex-1 h-8" onClick={() => navigateClient('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {showAdd && (
          <div className="space-y-2 p-2 bg-amber-50 dark:bg-zinc-800 rounded">
            <Input
              className="h-8 text-sm"
              placeholder={isUrdu ? 'نام' : 'Name'}
              value={naam}
              onChange={(e) => setNaam(e.target.value)}
              dir="auto"
            />
            <Input
              className="h-8 text-sm"
              placeholder={isUrdu ? 'فون نمبر' : 'Phone'}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              dir="ltr"
            />
            <Button size="sm" className="w-full" onClick={handleAdd}>
              {isUrdu ? 'گاہک شامل کریں' : 'Add Customer'}
            </Button>
          </div>
        )}

        {editMode && selectedClient && (
          <div className="space-y-2 p-2 bg-amber-50 dark:bg-zinc-800 rounded">
            <Input
              className="h-8 text-sm"
              value={naam}
              onChange={(e) => setNaam(e.target.value)}
              dir="auto"
            />
            <Input
              className="h-8 text-sm"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              dir="ltr"
            />
            <Button size="sm" className="w-full" onClick={handleUpdate}>
              {isUrdu ? 'محفوظ کریں' : 'Save'}
            </Button>
          </div>
        )}

        {selectedClient && !editMode && (
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="text-xs font-mono bg-amber-100 dark:bg-zinc-700 px-1.5 py-0.5 rounded">{selectedClient.code}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-3.5 w-3.5" />
              <span dir="ltr">{selectedClient.phone || '-'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Gem className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              <span>
                {isUrdu ? 'سونے کا بیلنس' : 'Gold Balance'}:{' '}
                <strong className="text-amber-700 dark:text-amber-400">{selectedClient.balance_sona.toFixed(3)}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CircleDollarSign className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
              <span>
                {isUrdu ? 'کیش بیلنس' : 'Cash Balance'}:{' '}
                <strong className="text-green-700 dark:text-green-400">{selectedClient.balance_cash.toFixed(2)}</strong>
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
