-- ============================================
-- SCHEMA AKADEMOS - Base de données complète
-- ============================================

-- Table akademos (newsletter/waiting list)
CREATE TABLE public.akademos (
  id bigint NOT NULL DEFAULT nextval('akademos_id_seq'::regclass),
  email text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT akademos_pkey PRIMARY KEY (id)
);

-- Table des étudiants
CREATE TABLE public.students (
  id uuid NOT NULL,
  nom text NOT NULL,
  prenom text NOT NULL,
  email text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT students_pkey PRIMARY KEY (id),
  CONSTRAINT students_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Table des professeurs
CREATE TABLE public.teachers (
  id uuid NOT NULL,
  nom text NOT NULL,
  prenom text NOT NULL,
  email text NOT NULL UNIQUE,
  code_invitation text NOT NULL UNIQUE, -- Code unique pour chaque professeur
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT teachers_pkey PRIMARY KEY (id),
  CONSTRAINT teachers_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Index pour améliorer les recherches par code
CREATE INDEX idx_teachers_code_invitation ON public.teachers(code_invitation);

-- Table de relation professeur-élève
CREATE TABLE public.teacher_student_relations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL,
  student_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'active', -- active, inactive, pending
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT teacher_student_relations_pkey PRIMARY KEY (id),
  CONSTRAINT teacher_student_relations_teacher_fkey FOREIGN KEY (teacher_id) REFERENCES public.teachers(id) ON DELETE CASCADE,
  CONSTRAINT teacher_student_relations_student_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE,
  CONSTRAINT unique_teacher_student UNIQUE (teacher_id, student_id)
);

-- Index pour améliorer les performances des requêtes
CREATE INDEX idx_relations_teacher ON public.teacher_student_relations(teacher_id);
CREATE INDEX idx_relations_student ON public.teacher_student_relations(student_id);

-- Table des messages
CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  relation_id uuid NOT NULL, -- Référence à la relation prof-élève
  sender_id uuid NOT NULL, -- ID de l'expéditeur (peut être prof ou élève)
  sender_type text NOT NULL, -- 'teacher' ou 'student'
  content text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT messages_relation_fkey FOREIGN KEY (relation_id) REFERENCES public.teacher_student_relations(id) ON DELETE CASCADE,
  CONSTRAINT messages_sender_check CHECK (sender_type IN ('teacher', 'student'))
);

-- Index pour améliorer les performances
CREATE INDEX idx_messages_relation ON public.messages(relation_id);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);

-- Table des créneaux (disponibilités et rendez-vous)
CREATE TABLE public.time_slots (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  relation_id uuid NOT NULL,
  proposed_by_id uuid NOT NULL, -- ID de celui qui propose (prof ou élève)
  proposed_by_type text NOT NULL, -- 'teacher' ou 'student'
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone NOT NULL,
  status text NOT NULL DEFAULT 'proposed', -- proposed, accepted, rejected, cancelled
  title text,
  description text,
  location text, -- Lieu (physique ou lien visio)
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT time_slots_pkey PRIMARY KEY (id),
  CONSTRAINT time_slots_relation_fkey FOREIGN KEY (relation_id) REFERENCES public.teacher_student_relations(id) ON DELETE CASCADE,
  CONSTRAINT time_slots_proposed_by_check CHECK (proposed_by_type IN ('teacher', 'student')),
  CONSTRAINT time_slots_time_check CHECK (end_time > start_time)
);

-- Index pour améliorer les performances
CREATE INDEX idx_time_slots_relation ON public.time_slots(relation_id);
CREATE INDEX idx_time_slots_start_time ON public.time_slots(start_time);
CREATE INDEX idx_time_slots_status ON public.time_slots(status);

-- Table des documents (copies, ressources, etc.)
CREATE TABLE public.documents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  relation_id uuid NOT NULL,
  uploader_id uuid NOT NULL, -- ID de celui qui upload (prof ou élève)
  uploader_type text NOT NULL, -- 'teacher' ou 'student'
  document_type text NOT NULL, -- 'copy', 'resource', 'correction', 'exercise', 'other'
  title text NOT NULL,
  description text,
  file_url text NOT NULL, -- URL du fichier dans Supabase Storage
  file_name text NOT NULL,
  file_size bigint, -- Taille en bytes
  mime_type text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT documents_pkey PRIMARY KEY (id),
  CONSTRAINT documents_relation_fkey FOREIGN KEY (relation_id) REFERENCES public.teacher_student_relations(id) ON DELETE CASCADE,
  CONSTRAINT documents_uploader_check CHECK (uploader_type IN ('teacher', 'student')),
  CONSTRAINT documents_type_check CHECK (document_type IN ('copy', 'resource', 'correction', 'exercise', 'other'))
);

-- Index pour améliorer les performances
CREATE INDEX idx_documents_relation ON public.documents(relation_id);
CREATE INDEX idx_documents_type ON public.documents(document_type);
CREATE INDEX idx_documents_created_at ON public.documents(created_at DESC);

-- Table des notes
CREATE TABLE public.grades (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  relation_id uuid NOT NULL,
  student_id uuid NOT NULL,
  teacher_id uuid NOT NULL,
  subject text NOT NULL, -- Matière
  grade numeric(5,2) NOT NULL, -- Note (ex: 15.50)
  max_grade numeric(5,2) NOT NULL DEFAULT 20, -- Note maximale (généralement 20)
  title text NOT NULL, -- Titre de l'évaluation
  description text,
  date date NOT NULL,
  document_id uuid, -- Référence optionnelle au document de la copie
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT grades_pkey PRIMARY KEY (id),
  CONSTRAINT grades_relation_fkey FOREIGN KEY (relation_id) REFERENCES public.teacher_student_relations(id) ON DELETE CASCADE,
  CONSTRAINT grades_student_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE,
  CONSTRAINT grades_teacher_fkey FOREIGN KEY (teacher_id) REFERENCES public.teachers(id) ON DELETE CASCADE,
  CONSTRAINT grades_document_fkey FOREIGN KEY (document_id) REFERENCES public.documents(id) ON DELETE SET NULL,
  CONSTRAINT grades_value_check CHECK (grade >= 0 AND grade <= max_grade)
);

-- Index pour améliorer les performances
CREATE INDEX idx_grades_relation ON public.grades(relation_id);
CREATE INDEX idx_grades_student ON public.grades(student_id);
CREATE INDEX idx_grades_date ON public.grades(date DESC);
CREATE INDEX idx_grades_subject ON public.grades(subject);

-- ============================================
-- FONCTIONS ET TRIGGERS
-- ============================================

-- Fonction pour générer un code d'invitation unique
CREATE OR REPLACE FUNCTION generate_invitation_code()
RETURNS text AS $$
DECLARE
  new_code text;
  code_exists boolean;
BEGIN
  LOOP
    -- Génère un code aléatoire de 8 caractères (lettres majuscules et chiffres)
    new_code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
    
    -- Vérifie si le code existe déjà
    SELECT EXISTS(SELECT 1 FROM public.teachers WHERE code_invitation = new_code) INTO code_exists;
    
    -- Si le code n'existe pas, on sort de la boucle
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour générer automatiquement un code d'invitation lors de la création d'un professeur
CREATE OR REPLACE FUNCTION set_teacher_invitation_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.code_invitation IS NULL OR NEW.code_invitation = '' THEN
    NEW.code_invitation := generate_invitation_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_teacher_invitation_code
  BEFORE INSERT ON public.teachers
  FOR EACH ROW
  EXECUTE FUNCTION set_teacher_invitation_code();

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teachers_updated_at BEFORE UPDATE ON public.teachers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_relations_updated_at BEFORE UPDATE ON public.teacher_student_relations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_slots_updated_at BEFORE UPDATE ON public.time_slots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_grades_updated_at BEFORE UPDATE ON public.grades
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_student_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;

-- Policies pour students
CREATE POLICY "Students can view their own data" ON public.students
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Students can update their own data" ON public.students
  FOR UPDATE USING (auth.uid() = id);

-- Policies pour teachers
CREATE POLICY "Teachers can view their own data" ON public.teachers
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Teachers can update their own data" ON public.teachers
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can view teacher codes for joining" ON public.teachers
  FOR SELECT USING (true);

-- Policies pour teacher_student_relations
CREATE POLICY "Users can view their relations" ON public.teacher_student_relations
  FOR SELECT USING (
    auth.uid() = teacher_id OR auth.uid() = student_id
  );

CREATE POLICY "Students can create relations" ON public.teacher_student_relations
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Teachers and students can update their relations" ON public.teacher_student_relations
  FOR UPDATE USING (
    auth.uid() = teacher_id OR auth.uid() = student_id
  );

-- Policies pour messages
CREATE POLICY "Users can view messages in their relations" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.teacher_student_relations
      WHERE id = relation_id
      AND (teacher_id = auth.uid() OR student_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their relations" ON public.messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teacher_student_relations
      WHERE id = relation_id
      AND (teacher_id = auth.uid() OR student_id = auth.uid())
    )
    AND sender_id = auth.uid()
  );

CREATE POLICY "Users can update their own messages" ON public.messages
  FOR UPDATE USING (sender_id = auth.uid());

-- Policies pour time_slots
CREATE POLICY "Users can view time slots in their relations" ON public.time_slots
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.teacher_student_relations
      WHERE id = relation_id
      AND (teacher_id = auth.uid() OR student_id = auth.uid())
    )
  );

CREATE POLICY "Users can create time slots in their relations" ON public.time_slots
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teacher_student_relations
      WHERE id = relation_id
      AND (teacher_id = auth.uid() OR student_id = auth.uid())
    )
    AND proposed_by_id = auth.uid()
  );

CREATE POLICY "Users can update time slots in their relations" ON public.time_slots
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.teacher_student_relations
      WHERE id = relation_id
      AND (teacher_id = auth.uid() OR student_id = auth.uid())
    )
  );

-- Policies pour documents
CREATE POLICY "Users can view documents in their relations" ON public.documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.teacher_student_relations
      WHERE id = relation_id
      AND (teacher_id = auth.uid() OR student_id = auth.uid())
    )
  );

CREATE POLICY "Users can upload documents in their relations" ON public.documents
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teacher_student_relations
      WHERE id = relation_id
      AND (teacher_id = auth.uid() OR student_id = auth.uid())
    )
    AND uploader_id = auth.uid()
  );

CREATE POLICY "Users can delete their own documents" ON public.documents
  FOR DELETE USING (uploader_id = auth.uid());

-- Policies pour grades
CREATE POLICY "Students can view their own grades" ON public.grades
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Teachers can view grades for their students" ON public.grades
  FOR SELECT USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can create grades for their students" ON public.grades
  FOR INSERT WITH CHECK (
    teacher_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.teacher_student_relations
      WHERE teacher_id = auth.uid() AND student_id = NEW.student_id
    )
  );

CREATE POLICY "Teachers can update their students' grades" ON public.grades
  FOR UPDATE USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can delete their students' grades" ON public.grades
  FOR DELETE USING (teacher_id = auth.uid());

-- ============================================
-- VUES UTILES (OPTIONAL)
-- ============================================

-- Vue pour avoir un résumé des relations avec les infos des profs et élèves
CREATE OR REPLACE VIEW public.relations_with_details AS
SELECT 
  r.id as relation_id,
  r.status,
  r.created_at as relation_created_at,
  t.id as teacher_id,
  t.nom as teacher_nom,
  t.prenom as teacher_prenom,
  t.email as teacher_email,
  s.id as student_id,
  s.nom as student_nom,
  s.prenom as student_prenom,
  s.email as student_email
FROM public.teacher_student_relations r
JOIN public.teachers t ON r.teacher_id = t.id
JOIN public.students s ON r.student_id = s.id;

-- Vue pour les statistiques des notes par élève
CREATE OR REPLACE VIEW public.student_grade_statistics AS
SELECT 
  student_id,
  subject,
  COUNT(*) as total_grades,
  AVG(grade) as average_grade,
  MIN(grade) as min_grade,
  MAX(grade) as max_grade,
  MIN(date) as first_grade_date,
  MAX(date) as last_grade_date
FROM public.grades
GROUP BY student_id, subject;

-- ============================================
-- DONNÉES DE TEST (OPTIONAL - à supprimer en production)
-- ============================================

-- Exemple d'insertion d'un professeur (après création d'un compte auth)
-- INSERT INTO public.teachers (id, nom, prenom, email)
-- VALUES ('uuid-from-auth-users', 'Dupont', 'Jean', 'jean.dupont@example.com');

-- Le code d'invitation sera automatiquement généré par le trigger
